import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const outputDir = "artifacts/house-visual-review";
await mkdir(outputDir, { recursive: true });

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  browser: "Chromium (Playwright)",
  screenshots: [],
  roomArrivals: [],
  frameStates: [],
  runtimeErrors: [],
  notes: [],
};

const browser = await chromium.launch({
  headless: true,
  timeout: 15000,
  args: [
    "--enable-webgl",
    "--ignore-gpu-blocklist",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});

function captureRuntimeErrors(page, label) {
  page.on("pageerror", (error) => {
    report.runtimeErrors.push({ view: label, message: String(error) });
  });
}

async function waitForExperience(page) {
  await page.locator("canvas, .fallback-art").first().waitFor({ state: "visible", timeout: 20000 });
  await page.waitForTimeout(900);
}

async function saveScreenshot(page, filename) {
  const filepath = outputDir + "/" + filename;
  if (/stair|landing-turn/i.test(filename)) {
    report.walkingHudHiddenDuringStairCaptures = await page.locator(".room-welcome.is-walking").evaluate((element) => {
      const style = getComputedStyle(element);
      return style.visibility === "hidden" && Number(style.opacity) === 0;
    }).catch(() => false);
  }
  const frameState = await page.locator("canvas").first().evaluate((canvas) => {
    const data = canvas.dataset;
    return {
      cameraPosition: data.cameraPosition ? data.cameraPosition.split(",").map(Number) : null,
      cameraDirection: data.cameraDirection ? data.cameraDirection.split(",").map(Number) : null,
      cameraZone: data.cameraZone || null,
      destination: data.destination || null,
      routeProgress: data.routeProgress || null,
    };
  }).catch(() => null);
  report.frameStates.push({ filename, ...frameState });
  try {
    await page.screenshot({ path: filepath, animations: "allow", timeout: 30000 });
    report.screenshots.push(filename);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    report.runtimeErrors.push({ view: filename, message: "Screenshot capture failed: " + message });
    report.notes.push("Could not save " + filename + "; continuing to collect the rest of the visual review.");
  }
}

async function arrivalStatus(page, slug, name, timeout = 45000) {
  await page.waitForFunction(
    () => {
      const label = document.querySelector(".room-welcome .eyebrow");
      return Boolean(label?.textContent?.includes("YOU ARE HERE"));
    },
    null,
    { timeout },
  ).catch(() => undefined);

  const label = await page.locator(".room-welcome .eyebrow").textContent().catch(() => "");
  const heading = await page.locator("#room-title").textContent().catch(() => "");
  const arrived = Boolean(label?.includes("YOU ARE HERE") && heading?.trim() === name);
  report.roomArrivals.push({ slug, expected: name, actualHeading: heading?.trim() || null, label: label?.trim() || null, arrived });
  if (!arrived) report.notes.push("Arrival did not settle before the screenshot for " + slug + "; inspect this frame and arrival record.");
  return arrived;
}

async function openMap(page) {
  await page.waitForFunction(() => {
    const roomButton = document.querySelector(".room-welcome .primary");
    const headerButton = Array.from(document.querySelectorAll(".header button"))
      .find((button) => /house map/i.test(button.textContent || ""));
    return Boolean((roomButton && !roomButton.disabled) || (headerButton && !headerButton.disabled));
  }, null, { timeout: 15000 });
  const roomMapButton = page.locator(".room-welcome").getByRole("button", { name: /open the house map/i });
  if (await roomMapButton.isVisible().catch(() => false) && await roomMapButton.isEnabled().catch(() => false)) {
    await roomMapButton.click();
  } else {
    await page.locator(".header").getByRole("button", { name: /house map/i }).click();
  }
  await page.locator(".map-panel").waitFor({ state: "visible", timeout: 15000 });
}

async function waitForCameraPhase(page, destination, phase, timeout = 30000) {
  await page.waitForFunction(({ expectedDestination, expectedPhase }) => {
    const canvas = document.querySelector("canvas");
    if (!canvas || canvas.dataset.destination !== expectedDestination) return false;
    const position = canvas.dataset.cameraPosition?.split(",").map(Number);
    if (!position || position.length !== 3 || position.some((value) => !Number.isFinite(value))) return false;
    const [x, y, z] = position;
    const zone = canvas.dataset.cameraZone;
    switch (expectedPhase) {
      case "lower-stair-flight":
        return y > 2.9 && y < 4.25 && z < -1.0 && z > -4.2;
      case "upper-side-landing":
        return y > 4.4 && y < 4.9 && x > 0.55 && z < -0.6 && z > -4.1;
      case "roof-stair-flight":
        return y > 5.1 && y < 7.1 && z < 2.0 && z > -2.75;
      case "roof-hatch-clear":
        return zone === "roof" && y > 7.0 && x > 1.0 && z > -2.75 && z < -1.0;
      case "front-door-clear":
        return zone === "outside" && z > 4.96;
      default:
        return false;
    }
  }, { expectedDestination: destination, expectedPhase: phase }, { timeout });
}

async function selectDirectoryRoom(page, name, slug, transitionCaptures = []) {
  const selector = page.locator(".map-directory").getByRole("button", { name, exact: true }).first();
  await selector.waitFor({ state: "visible", timeout: 12000 });
  await selector.click();
  await page.waitForFunction((expected) => window.location.pathname === "/room/" + expected, slug, { timeout: 12000 });
  const transitionStarted = Date.now();
  for (const capture of transitionCaptures) {
    if (capture.phase) {
      try {
        await waitForCameraPhase(page, slug, capture.phase, capture.timeout ?? 30000);
      } catch {
        report.notes.push("Timed out waiting for camera phase " + capture.phase + " on route " + slug + "; capturing the current frame instead.");
      }
    } else {
      const delay = Math.max(0, capture.afterMs - (Date.now() - transitionStarted));
      if (delay > 0) await page.waitForTimeout(delay);
    }
    await saveScreenshot(page, capture.filename);
  }
  await arrivalStatus(page, slug, name);
}

try {
const desktop = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
  reducedMotion: "no-preference",
});
desktop.setDefaultTimeout(8000);
desktop.setDefaultNavigationTimeout(15000);
captureRuntimeErrors(desktop, "desktop");
await desktop.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
await waitForExperience(desktop);
report.navigationGuideDetected = await desktop.locator(".navigation-guide").isVisible().catch(() => false);
report.navigationGuideText = (await desktop.locator(".navigation-guide").innerText().catch(() => "")).trim();
report.webglCanvasDetected = (await desktop.locator("canvas").count()) > 0;
report.webgl2ContextAvailable = await desktop.locator("canvas").first().evaluate((canvas) => {
  try { return Boolean(canvas.getContext("webgl2")); } catch { return false; }
}).catch(() => false);
await saveScreenshot(desktop, "01-exterior-desktop.png");

// Click the gold in-scene doorway marker to verify that visual navigation is genuinely interactive.
await desktop.locator("canvas").click({ position: { x: 665, y: 449 } });
await desktop.waitForFunction(() => window.location.pathname === "/room/entrance", null, { timeout: 8000 });
await arrivalStatus(desktop, "entrance", "Front Door & Entrance", 45000);
await saveScreenshot(desktop, "02-entrance-eye-level.png");

await openMap(desktop);
const directoryCount = await desktop.locator(".map-directory .map-rooms button").count();
report.roomDirectoryButtonCount = directoryCount;
if (directoryCount !== 13) report.notes.push("Expected 13 room directory buttons; found " + directoryCount + ".");
await saveScreenshot(desktop, "03-house-map-desktop.png");

await selectDirectoryRoom(desktop, "Family Table", "family-table");
await saveScreenshot(desktop, "04-family-table-eye-level.png");

await openMap(desktop);
await selectDirectoryRoom(desktop, "Living Room", "living-room");
await saveScreenshot(desktop, "05-living-room-eye-level.png");

await openMap(desktop);
await selectDirectoryRoom(desktop, "Kitchen", "kitchen");
await saveScreenshot(desktop, "06-kitchen-eye-level.png");

await openMap(desktop);
await selectDirectoryRoom(desktop, "Library", "library");
await saveScreenshot(desktop, "07-library-eye-level.png");

await openMap(desktop);
await selectDirectoryRoom(desktop, "Pets' Corner", "pets-corner");
await saveScreenshot(desktop, "08-pets-corner-eye-level.png");

await openMap(desktop);
await selectDirectoryRoom(desktop, "Prayer Room / Musalla", "prayer-room");
await saveScreenshot(desktop, "09-prayer-room-eye-level.png");

await openMap(desktop);
await selectDirectoryRoom(desktop, "Zineb's Private Room", "zineb-room", [
  { phase: "lower-stair-flight", filename: "13-stair-ascent-midflight.png" },
  { phase: "upper-side-landing", filename: "14-upper-landing-turn.png" },
]);
await saveScreenshot(desktop, "10-upper-floor-eye-level.png");

await openMap(desktop);
await selectDirectoryRoom(desktop, "Garden", "garden", [
  { phase: "upper-side-landing", filename: "15a-upper-landing-to-stair.png" },
  { phase: "lower-stair-flight", filename: "15-stair-descent-midflight.png" },
  { phase: "front-door-clear", filename: "15-front-door-exit.png" },
]);
await saveScreenshot(desktop, "11-garden-eye-level.png");

await openMap(desktop);
await selectDirectoryRoom(desktop, "Rooftop Terrace", "rooftop", [
  { phase: "lower-stair-flight", filename: "16-ground-stair-ascent.png" },
  { phase: "upper-side-landing", filename: "16-upper-bridge-after-ascent.png" },
  { phase: "roof-stair-flight", filename: "16-roof-stair-ascent.png" },
  { phase: "roof-hatch-clear", filename: "17-roof-hatch-exit.png" },
]);
await saveScreenshot(desktop, "12-rooftop-eye-level.png");

const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
  reducedMotion: "reduce",
});
mobile.setDefaultTimeout(8000);
mobile.setDefaultNavigationTimeout(15000);
captureRuntimeErrors(mobile, "mobile");
await mobile.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
await waitForExperience(mobile);
report.mobileNavigationGuideVisible = await mobile.locator(".navigation-guide").isVisible().catch(() => false);
report.mobileDocumentWidth = await mobile.evaluate(() => document.documentElement.scrollWidth);
report.mobileViewportWidth = 390;
report.mobileHasHorizontalDocumentOverflow = report.mobileDocumentWidth > report.mobileViewportWidth;
await saveScreenshot(mobile, "08-exterior-mobile.png");
await mobile.locator(".header").getByRole("button", { name: /house map/i }).click();
await mobile.locator(".map-panel").waitFor({ state: "visible", timeout: 8000 });
report.mobileRoomDirectoryButtonCount = await mobile.locator(".map-directory .map-rooms button").count();
await saveScreenshot(mobile, "09-house-map-mobile.png");

const stairAscent = report.frameStates.find((frame) => frame.filename === "13-stair-ascent-midflight.png");
const stairDescent = report.frameStates.find((frame) => frame.filename === "15-stair-descent-midflight.png");
report.stairCameraAiming = {
  ascentDirectionY: stairAscent?.cameraDirection?.[1] ?? null,
  descentDirectionY: stairDescent?.cameraDirection?.[1] ?? null,
  looksUpDuringAscent: typeof stairAscent?.cameraDirection?.[1] === "number" &&
    stairAscent.cameraDirection[1] > 0.1 && stairAscent.cameraDirection[1] < 0.45,
  looksDownDuringDescent: typeof stairDescent?.cameraDirection?.[1] === "number" &&
    stairDescent.cameraDirection[1] < -0.1 && stairDescent.cameraDirection[1] > -0.45,
};
if (!report.stairCameraAiming.looksUpDuringAscent) {
  report.notes.push("Camera should pitch upward while climbing the lower stair flight.");
}
if (!report.stairCameraAiming.looksDownDuringDescent) {
  report.notes.push("Camera should pitch downward while descending the lower stair flight.");
}

} catch (error) {
  const message = error instanceof Error ? (error.stack || error.message) : String(error);
  report.runtimeErrors.push({ view: "capture-script", message });
  report.notes.push("Visual review stopped safely after an interaction or navigation failure: " + message.split("\n")[0]);
  process.exitCode = 1;
} finally {
  await browser.close().catch((error) => {
    report.notes.push("Browser shutdown reported an error: " + String(error));
  });
  await writeFile(outputDir + "/browser-review.json", JSON.stringify(report, null, 2) + "\n");
}

console.log(JSON.stringify(report, null, 2));
if (
  report.runtimeErrors.length > 0 ||
  report.roomArrivals.some((arrival) => !arrival.arrived) ||
  !report.navigationGuideDetected ||
  !report.mobileNavigationGuideVisible ||
  !report.walkingHudHiddenDuringStairCaptures ||
  !report.stairCameraAiming.looksUpDuringAscent ||
  !report.stairCameraAiming.looksDownDuringDescent ||
  report.mobileHasHorizontalDocumentOverflow ||
  report.roomDirectoryButtonCount !== 13 ||
  report.mobileRoomDirectoryButtonCount !== 13
) {
  process.exitCode = 1;
}
