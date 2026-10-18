import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { CAMERA_PHASE_RULES } from "./visualReviewPhases.mjs";

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
      walkSpeed: data.walkSpeed == null ? null : Number(data.walkSpeed),
      remainingPathDistance: data.remainingPathDistance == null ? null : Number(data.remainingPathDistance),
      currentWaypointDistance: data.currentWaypointDistance == null ? null : Number(data.currentWaypointDistance),
      nextWaypoint: data.nextWaypoint ? data.nextWaypoint.split(",").map(Number) : null,
    };
  }).catch(() => null);
  report.frameStates.push({ filename, ...frameState });
  try {
    // Animated stair-transition frames can be heavier than settled room stills.
    // Keep the capture mandatory but allow them 15 more seconds before a hard failure.
    const screenshotTimeout = /stair|landing-turn/i.test(filename) ? 45000 : 30000;
    await page.screenshot({ path: filepath, animations: "allow", timeout: screenshotTimeout });
    report.screenshots.push(filename);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    report.runtimeErrors.push({ view: filename, message: "Screenshot capture failed: " + message });
    report.notes.push("Could not save " + filename + "; continuing to collect the rest of the visual review.");
  }
}

async function arrivalStatus(page, slug, name, timeout = 12000) {
  // The old label could still say YOU ARE HERE for the previous room, so it was
  // possible to start opening the map while the new route was still in progress.
  await page.waitForFunction(
    (expectedName) => {
      const label = document.querySelector(".room-welcome .eyebrow");
      const heading = document.querySelector("#room-title");
      const primary = document.querySelector(".room-welcome .primary");
      const welcome = document.querySelector(".room-welcome");
      const progress = document.querySelector("canvas")?.dataset.routeProgress?.split("/").map(Number);
      const routeSettled = !welcome?.classList.contains("is-walking") &&
        (!progress || progress.length !== 2 ||
          (progress[1] === 0 && progress[0] === 0) || progress[0] >= progress[1]);
      return Boolean(
        routeSettled &&
        label?.textContent?.includes("YOU ARE HERE") &&
        heading?.textContent?.trim() === expectedName &&
        primary instanceof HTMLButtonElement &&
        !primary.disabled
      );
    },
    name,
    { timeout },
  ).catch(() => undefined);

  const label = await page.locator(".room-welcome .eyebrow").textContent().catch(() => "");
  const heading = await page.locator("#room-title").textContent().catch(() => "");
  const primaryEnabled = await page.locator(".room-welcome .primary").isEnabled().catch(() => false);
  const routeStatus = await page.locator("canvas").first().evaluate((canvas) => {
    const progress = canvas.dataset.routeProgress?.split("/").map(Number);
    return {
      walking: Boolean(document.querySelector(".room-welcome")?.classList.contains("is-walking")),
      progress: canvas.dataset.routeProgress || null,
      settled: !document.querySelector(".room-welcome")?.classList.contains("is-walking") &&
        (!progress || progress.length !== 2 ||
          (progress[1] === 0 && progress[0] === 0) || progress[0] >= progress[1]),
    };
  }).catch(() => ({walking:true,progress:null,settled:false}));
  const arrived = Boolean(routeStatus.settled && label?.includes("YOU ARE HERE") &&
    heading?.trim() === name && primaryEnabled);
  report.roomArrivals.push({ slug, expected: name, actualHeading: heading?.trim() || null, label: label?.trim() || null, arrived, walking: routeStatus.walking, routeProgress: routeStatus.progress });
  if (!arrived) report.notes.push("Arrival did not settle before the screenshot for " + slug + "; inspect this frame and arrival record.");
  return arrived;
}

async function captureStaticRoom(page, slug, name, filename) {
  try {
    // Deep-link the settled view. The map/route interaction is tested separately;
    // static views should not chain multiple long walks through one mutable UI state.
    await page.goto(new URL("/room/" + slug, baseUrl).toString(), {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    await waitForExperience(page);
    await page.addStyleTag({ content: "footer small { display: none !important; }" });
    await arrivalStatus(page, slug, name, 12000);
    await saveScreenshot(page, filename);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    report.runtimeErrors.push({ view: filename, message: "Static room capture failed: " + message });
    report.notes.push("Could not fully prepare " + filename + "; continuing to the next destination.");
  }
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
  const rule = CAMERA_PHASE_RULES[phase];
  if (!rule) throw new Error("Unknown camera phase: " + phase);
  await page.waitForFunction(({ expectedDestination, phaseRule }) => {
    const canvas = document.querySelector("canvas");
    if (!canvas || canvas.dataset.destination !== expectedDestination) return false;
    const position = canvas.dataset.cameraPosition?.split(",").map(Number);
    if (!position || position.length !== 3 || position.some((value) => !Number.isFinite(value))) return false;
    const [x, y, z] = position;
    const zone = canvas.dataset.cameraZone;
    const within = (value, bounds) => !bounds ||
      ((bounds[0] == null || value > bounds[0]) && (bounds[1] == null || value < bounds[1]));
    return (!phaseRule.zone || zone === phaseRule.zone) &&
      within(x, phaseRule.x) && within(y, phaseRule.y) && within(z, phaseRule.z);
  }, { expectedDestination: destination, phaseRule: rule }, { timeout });
}

async function selectDirectoryRoom(page, name, slug, transitionCaptures = [], arrivalTimeout = 12000) {
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
  return await arrivalStatus(page, slug, name, arrivalTimeout);
}

try {
const desktop = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
});
desktop.setDefaultTimeout(8000);
desktop.setDefaultNavigationTimeout(15000);
captureRuntimeErrors(desktop, "desktop");
await desktop.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
await waitForExperience(desktop);
await desktop.addStyleTag({ content: "footer small { display: none !important; }" });
report.navigationGuideDetected = await desktop.locator(".navigation-guide").isVisible().catch(() => false);
report.navigationGuideText = (await desktop.locator(".navigation-guide").innerText().catch(() => "")).trim();
report.webglCanvasDetected = (await desktop.locator("canvas").count()) > 0;
report.webgl2ContextAvailable = await desktop.locator("canvas").first().evaluate((canvas) => {
  try { return Boolean(canvas.getContext("webgl2")); } catch { return false; }
}).catch(() => false);
await saveScreenshot(desktop, "01-exterior-desktop.png");

// Click the gold in-scene doorway marker to verify visual navigation. Its projected height
// depends on the current first-person camera pose, so target the centered marker relative
// to the live canvas rather than a stale absolute coordinate.
const exteriorCanvas = desktop.locator("canvas");
const exteriorCanvasBox = await exteriorCanvas.boundingBox();
if (!exteriorCanvasBox) throw new Error("The exterior canvas has no measurable bounds.");
await exteriorCanvas.click({
  position: {
    x: exteriorCanvasBox.width / 2,
    y: exteriorCanvasBox.height * 0.515,
  },
});
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

await captureStaticRoom(desktop, "living-room", "Living Room", "05-living-room-eye-level.png");
await captureStaticRoom(desktop, "kitchen", "Kitchen", "06-kitchen-eye-level.png");
await captureStaticRoom(desktop, "library", "Library", "07-library-eye-level.png");
await captureStaticRoom(desktop, "pets-corner", "Pets' Corner", "08-pets-corner-eye-level.png");
await captureStaticRoom(desktop, "prayer-room", "Prayer Room / Musalla", "09-prayer-room-eye-level.png");
await captureStaticRoom(desktop, "zineb-room", "Zineb's Private Room", "10-upper-floor-eye-level.png");
await captureStaticRoom(desktop, "garden", "Garden", "11-garden-eye-level.png");
await captureStaticRoom(desktop, "rooftop", "Rooftop Terrace", "12-rooftop-eye-level.png");

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

// Keep ordinary room stills deterministic and fast under reduced motion, but exercise
// real walking on a dedicated page so stair framing and camera pitch remain tested.
const motionProbe = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
});
motionProbe.setDefaultTimeout(10000);
motionProbe.setDefaultNavigationTimeout(15000);
captureRuntimeErrors(motionProbe, "motion-probe");
await motionProbe.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
await waitForExperience(motionProbe);
await motionProbe.locator(".welcome").getByRole("button", { name: /enter the house/i }).click();
await motionProbe.waitForFunction(() => window.location.pathname === "/room/entrance", null, { timeout: 8000 });
await arrivalStatus(motionProbe, "entrance-motion-probe", "Front Door & Entrance", 10000);
await openMap(motionProbe);
await selectDirectoryRoom(motionProbe, "Family Table", "family-table");

// Re-enable normal motion after the setup snap so stair captures test the real animated route.
await motionProbe.emulateMedia({ reducedMotion: "no-preference" });
await motionProbe.waitForTimeout(180);
await openMap(motionProbe);
const rooftopArrived = await selectDirectoryRoom(motionProbe, "Rooftop Terrace", "rooftop", [
  { phase: "lower-stair-clearance", filename: "13-stair-ascent-midflight.png" },
  { phase: "upper-side-landing", filename: "14-upper-landing-turn.png" },
  { phase: "roof-stair-flight", filename: "16-roof-stair-ascent.png" },
  { phase: "roof-hatch-clear", filename: "17-roof-hatch-exit.png" },
], 90000);
await saveScreenshot(motionProbe, "18-rooftop-motion-probe.png");

if (rooftopArrived) {
  await openMap(motionProbe);
  const returnedToGround = await selectDirectoryRoom(motionProbe, "Family Table", "family-table", [
    { phase: "lower-stair-flight", filename: "15-stair-descent-midflight.png", timeout: 90000 },
  ], 45000);
  if (!returnedToGround) {
    report.notes.push("The descent route did not settle at the family table before the movement probe ended.");
  }
} else {
  report.notes.push("The rooftop route did not settle, so the descent probe was skipped instead of timing out while trying to reopen the map.");
}
await motionProbe.close();

const stairAscent = report.frameStates.find((frame) => frame.filename === "13-stair-ascent-midflight.png");
const stairDescent = report.frameStates.find((frame) => frame.filename === "15-stair-descent-midflight.png");
const upperLandingTurn = report.frameStates.find((frame) => frame.filename === "14-upper-landing-turn.png");
report.upperLandingAiming = {
  directionY: upperLandingTurn?.cameraDirection?.[1] ?? null,
  looksDownPastStairUnderside: typeof upperLandingTurn?.cameraDirection?.[1] === "number" &&
    upperLandingTurn.cameraDirection[1] < -0.14 && upperLandingTurn.cameraDirection[1] > -0.32,
};
if (!report.upperLandingAiming.looksDownPastStairUnderside) {
  report.notes.push("The upper-landing turn should pitch modestly down toward the clear bridge floor rather than hold the horizon under the roof stair.");
}
report.stairCameraAiming = {
  ascentDirectionY: stairAscent?.cameraDirection?.[1] ?? null,
  descentDirectionY: stairDescent?.cameraDirection?.[1] ?? null,
  clearsUpperLandingOnAscent: typeof stairAscent?.cameraDirection?.[1] === "number" &&
    stairAscent.cameraDirection[1] > 0.10 && stairAscent.cameraDirection[1] < 0.32,
  looksDownDuringDescent: typeof stairDescent?.cameraDirection?.[1] === "number" &&
    stairDescent.cameraDirection[1] < -0.44 && stairDescent.cameraDirection[1] > -0.65,
};
if (!report.stairCameraAiming.clearsUpperLandingOnAscent) {
  report.notes.push("As the eye reaches upper-floor level, the ascent camera must pitch upward enough to see over the landing fascia into the open upper bridge.");
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
  !report.stairCameraAiming.clearsUpperLandingOnAscent ||
  !report.stairCameraAiming.looksDownDuringDescent ||
  !report.upperLandingAiming.looksDownPastStairUnderside ||
  report.mobileHasHorizontalDocumentOverflow ||
  report.roomDirectoryButtonCount !== 13 ||
  report.mobileRoomDirectoryButtonCount !== 13
) {
  process.exitCode = 1;
}
