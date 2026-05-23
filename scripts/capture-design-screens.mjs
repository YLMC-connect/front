import { execFileSync, spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildDesignRouteRows } from "./design-screen-routes.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outputRoot =
  process.env.YLMC_APP_SCREENSHOT_DIR ??
  "/private/tmp/ylmc-golden-screens/2026-05-23/app";
const outputPngDir = process.env.YLMC_APP_SCREENSHOT_PNG_DIR ?? outputRoot;
const appId = process.env.YLMC_DEV_CLIENT_APP_ID ?? "com.ylmc.connect.dev";
const metroPort = process.env.YLMC_METRO_PORT ?? "8081";
const routeDelayMs = Number(process.env.YLMC_CAPTURE_ROUTE_DELAY_MS ?? "5000");
const warmupDelayMs = Number(process.env.YLMC_CAPTURE_WARMUP_MS ?? "9000");
const resetEachRoute = process.env.YLMC_CAPTURE_RESET_EACH_ROUTE === "1";
const routeOpenRepeats = Number(
  process.env.YLMC_CAPTURE_ROUTE_OPEN_REPEATS ?? "1",
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const run = (command, args, options = {}) =>
  execFileSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  }).trim();

const adb = (device, args, options = {}) =>
  run("adb", ["-s", device, ...args], options);

const pickAndroidDevice = () => {
  const output = run("adb", ["devices"]);
  const devices = output
    .split("\n")
    .slice(1)
    .map((line) => line.trim().split(/\s+/))
    .filter(([serial, state]) => serial && state === "device")
    .map(([serial]) => serial);

  if (devices.length === 0) {
    throw new Error(
      "No Android emulator/device is available for screenshot capture.",
    );
  }

  return devices.find((serial) => serial.startsWith("emulator-")) ?? devices[0];
};

const metroStatusUrl = `http://localhost:${metroPort}/status`;
const devClientBundleUrl = `http://127.0.0.1:${metroPort}`;

const isMetroRunning = async () => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(metroStatusUrl, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    const body = await response.text();

    return body.includes("packager-status:running");
  } catch {
    return false;
  }
};

const ensureMetro = async () => {
  if (await isMetroRunning()) {
    return;
  }

  const expoBin = existsSync(path.join(rootDir, "node_modules/.bin/expo"))
    ? path.join(rootDir, "node_modules/.bin/expo")
    : "expo";

  const metro = spawn(
    expoBin,
    ["start", "--dev-client", "--port", metroPort, "--host", "lan"],
    {
      cwd: rootDir,
      detached: true,
      stdio: "ignore",
    },
  );
  metro.unref();

  for (let attempt = 0; attempt < 60; attempt += 1) {
    await sleep(1000);
    if (await isMetroRunning()) {
      return;
    }
  }

  throw new Error("Metro did not report packager-status:running.");
};

const getDeviceSize = (device) => {
  const output = adb(device, ["shell", "wm", "size"]);
  const match = output.match(/Physical size:\s*(\d+)x(\d+)/);

  if (!match) {
    return { width: 1080, height: 2400 };
  }

  return { width: Number(match[1]), height: Number(match[2]) };
};

const tapPercent = (device, xRatio, yRatio) => {
  const { width, height } = getDeviceSize(device);
  adb(device, [
    "shell",
    "input",
    "tap",
    String(Math.round(width * xRatio)),
    String(Math.round(height * yRatio)),
  ]);
};

const openUrl = (device, url) => {
  adb(device, [
    "shell",
    "am",
    "start",
    "-W",
    "-a",
    "android.intent.action.VIEW",
    "-d",
    url,
    appId,
  ]);
};

const openRoute = (device, route) => {
  const deepLink = `ylmc-connect://${route}`;
  openUrl(device, deepLink);
};

const dismissDevMenu = async (device) => {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    console.log(`dismiss dev menu ${attempt + 1}/8`);
    tapPercent(device, 0.5, 0.895);
    await sleep(1200);
    tapPercent(device, 0.9, 0.46);
    await sleep(1200);
  }
};

const captureScreenshot = (device, destination) => {
  const result = spawnSync(
    "adb",
    ["-s", device, "exec-out", "screencap", "-p"],
    {
      encoding: null,
      maxBuffer: 30 * 1024 * 1024,
    },
  );

  if (result.status !== 0 || !result.stdout?.length) {
    throw new Error(
      result.stderr?.toString("utf8") ||
        "adb screencap did not return image data.",
    );
  }

  writeFileSync(destination, result.stdout);
};

const prepareDevClient = async (device) => {
  adb(device, ["reverse", `tcp:${metroPort}`, `tcp:${metroPort}`]);
  adb(device, ["shell", "am", "force-stop", appId]);
  adb(device, ["shell", "pm", "clear", appId]);

  const devClientUrl = `exp+ylmc-connect://expo-development-client/?url=${encodeURIComponent(
    devClientBundleUrl,
  )}`;

  console.log(`Opening Dev Client: ${devClientUrl}`);
  openUrl(device, devClientUrl);

  await sleep(6000);
  console.log("Selecting development server");
  tapPercent(device, 0.5, 0.24);
  await sleep(8000);
  await dismissDevMenu(device);
  await sleep(warmupDelayMs);
  console.log("Opening root route");
  openRoute(device, "/");
  await dismissDevMenu(device);
  await sleep(routeDelayMs);
};

const parseRange = (rows) => {
  const indexes = process.env.YLMC_CAPTURE_INDEXES;

  if (indexes) {
    const selectedIndexes = indexes
      .split(",")
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isInteger(value) && value >= 1);

    if (selectedIndexes.length === 0) {
      throw new Error("Invalid YLMC_CAPTURE_INDEXES.");
    }

    return {
      rows: selectedIndexes
        .filter((index) => index <= rows.length)
        .map((index) => rows[index - 1]),
      isFullCapture: false,
    };
  }

  const start = Number(process.env.YLMC_CAPTURE_START_INDEX ?? "1");
  const end = Number(process.env.YLMC_CAPTURE_END_INDEX ?? String(rows.length));

  if (Number.isNaN(start) || Number.isNaN(end) || start < 1 || end < start) {
    throw new Error("Invalid YLMC_CAPTURE_START_INDEX/YLMC_CAPTURE_END_INDEX.");
  }

  const normalizedEnd = Math.min(end, rows.length);

  return {
    rows: rows.slice(start - 1, normalizedEnd),
    isFullCapture: start === 1 && normalizedEnd === rows.length,
  };
};

const main = async () => {
  const rows = buildDesignRouteRows();
  const missing = rows.filter((row) => !row.route);

  if (missing.length > 0) {
    throw new Error(
      `Missing route mappings: ${missing.map((row) => row.id).join(", ")}`,
    );
  }

  const { rows: selectedRows, isFullCapture } = parseRange(rows);

  if (isFullCapture) {
    rmSync(outputPngDir, { recursive: true, force: true });
  }

  mkdirSync(outputPngDir, { recursive: true });

  await ensureMetro();
  const device = pickAndroidDevice();
  await prepareDevClient(device);

  const capturedRows = [];

  for (const row of selectedRows) {
    console.log(`${row.index}/${rows.length} ${row.id} -> ${row.route}`);

    if (resetEachRoute && row.route !== "/") {
      openRoute(device, "/");
      await sleep(routeDelayMs);
    }

    for (let attempt = 0; attempt < routeOpenRepeats; attempt += 1) {
      openRoute(device, row.route);
      await sleep(routeDelayMs);
    }

    const appScreenshot = path.join(outputPngDir, row.screenshotName);
    captureScreenshot(device, appScreenshot);
    capturedRows.push({ ...row, appScreenshot });
  }

  const tsv = [
    "section\tid\tcomponent\tvariant\troute\tappScreenshot",
    ...capturedRows.map((row) =>
      [
        row.section,
        row.id,
        row.component,
        row.variant,
        row.route,
        row.appScreenshot,
      ].join("\t"),
    ),
  ].join("\n");

  writeFileSync(
    path.join(outputRoot, "route-capture-results.json"),
    `${JSON.stringify(capturedRows, null, 2)}\n`,
  );
  writeFileSync(path.join(outputRoot, "route-capture-results.tsv"), `${tsv}\n`);

  console.log(`captured=${capturedRows.length}`);
  console.log(`output=${outputRoot}`);
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
