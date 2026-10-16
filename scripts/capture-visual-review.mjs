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
  runtimeErrors: [],
  notes: [],
};

const browser = await chromium.launch({
  headless: true,
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
  await page.screenshot({ path: filepath, animations: "disabled" });
  report.screenshots.push(filename);
}

async function arrivalStatus(page, slug, name, timeout = 9000) {
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
  const roomMapButton = page.locator(".room-welcome").getByRole("button", { name: /open the house map/i });
  if (await roomMapButton.isVisible().catch(() => false)) {
    await roomMapButton.click();
  } else {
    await page.locator(".header").getByRole("button", { name: /house map/i }).click();
  }
  await page.locator(".map-panel").waitFor({ state: "visible", timeout: 8000 });
}

async function selectDirectoryRoom(page, name, slug) {
  const selector = page.locator(".map-directory").getByRole("button", { name, exact: true }).first();
  await selector.waitFor({ state: "visible", timeout: 8000 });
  await selector.click();
  await page.waitForFunction((expected) => window.location.pathname === "/room/" + expected, slug, { timeout: 8000 });
  await arrivalStatus(page, slug, name);
}

const desktop = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
  reducedMotion: "no-preference",
});
captureRuntimeErrors(desktop, "desktop");
await desktop.goto(baseUrl, { waitUntil: "domcontentloaded" });
await waitForExperience(desktop);
report.webglCanvasDetected = (await desktop.locator("canvas").count()) > 0;
report.webgl2ContextAvailable = await desktop.locator("canvas").first().evaluate((canvas) => {
  try { return Boolean(canvas.getContext("webgl2")); } catch { return false; }
}).catch(() => false);
await saveScreenshot(desktop, "01-exterior-desktop.png");

await desktop.getByRole("button", { name: /enter the house/i }).click();
await arrivalStatus(desktop, "entrance", "Front Door & Entrance", 10000);
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
await selectDirectoryRoom(desktop, "Zineb's Private Room", "zineb-room");
await saveScreenshot(desktop, "10-upper-floor-eye-level.png");

await openMap(desktop);
await selectDirectoryRoom(desktop, "Garden", "garden");
await saveScreenshot(desktop, "11-garden-eye-level.png");

await openMap(desktop);
await selectDirectoryRoom(desktop, "Rooftop Terrace", "rooftop");
await saveScreenshot(desktop, "12-rooftop-eye-level.png");

const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
  reducedMotion: "reduce",
});
captureRuntimeErrors(mobile, "mobile");
await mobile.goto(baseUrl, { waitUntil: "domcontentloaded" });
await waitForExperience(mobile);
report.mobileDocumentWidth = await mobile.evaluate(() => document.documentElement.scrollWidth);
report.mobileViewportWidth = 390;
report.mobileHasHorizontalDocumentOverflow = report.mobileDocumentWidth > report.mobileViewportWidth;
await saveScreenshot(mobile, "08-exterior-mobile.png");
await mobile.locator(".header").getByRole("button", { name: /house map/i }).click();
await mobile.locator(".map-panel").waitFor({ state: "visible", timeout: 8000 });
report.mobileRoomDirectoryButtonCount = await mobile.locator(".map-directory .map-rooms button").count();
await saveScreenshot(mobile, "09-house-map-mobile.png");

await writeFile(outputDir + "/browser-review.json", JSON.stringify(report, null, 2) + "\n");
await browser.close();

console.log(JSON.stringify(report, null, 2));
if (report.runtimeErrors.length > 0) {
  process.exitCode = 1;
}
