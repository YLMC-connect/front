import { spawn } from "node:child_process";
import { execFileSync } from "node:child_process";
import { networkInterfaces } from "node:os";
import { resolve } from "node:path";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getLanHost() {
  if (process.env.EXPO_DEV_CLIENT_HOST) {
    return process.env.EXPO_DEV_CLIENT_HOST;
  }

  for (const interfaces of Object.values(networkInterfaces())) {
    for (const network of interfaces ?? []) {
      if (network.family === "IPv4" && !network.internal) {
        return network.address;
      }
    }
  }

  return "localhost";
}

const port = process.env.EXPO_DEV_CLIENT_PORT ?? "8081";
const packageName = process.env.YLMC_ANDROID_PACKAGE ?? "com.ylmc.connect.dev";
const hasAndroidEmulator = (() => {
  if (process.env.EXPO_DEV_CLIENT_URL) {
    return false;
  }

  try {
    const output = execFileSync("adb", ["devices"], { encoding: "utf8" });
    return output
      .split("\n")
      .some((line) => line.startsWith("emulator-") && line.includes("device"));
  } catch {
    return false;
  }
})();
const metroUrl =
  process.env.EXPO_DEV_CLIENT_METRO_URL ??
  (hasAndroidEmulator
    ? `http://localhost:${port}`
    : `http://${getLanHost()}:${port}`);
const devClientMetroUrl =
  process.env.EXPO_DEV_CLIENT_TARGET_METRO_URL ??
  (hasAndroidEmulator ? `http://127.0.0.1:${port}` : metroUrl);
const devClientUrl =
  process.env.EXPO_DEV_CLIENT_URL ??
  `exp+ylmc-connect://expo-development-client/?url=${encodeURIComponent(
    devClientMetroUrl,
  )}`;

function prepareAndroidEmulatorNetwork() {
  if (!hasAndroidEmulator) {
    return;
  }

  console.log("Preparing Android emulator network.");

  try {
    execFileSync("adb", ["reverse", `tcp:${port}`, `tcp:${port}`], {
      stdio: "ignore",
    });
  } catch {
    // Physical devices use LAN URL; emulator reverse is a best-effort helper.
  }
}

function prepareAndroidAppState() {
  if (!hasAndroidEmulator) {
    return;
  }

  console.log(`Preparing Android app state: ${packageName}`);

  for (const args of [
    ["shell", "input", "keyevent", "KEYCODE_WAKEUP"],
    ["shell", "wm", "dismiss-keyguard"],
    ["shell", "am", "force-stop", packageName],
    ["shell", "pm", "clear", packageName],
  ]) {
    try {
      execFileSync("adb", args, { stdio: "ignore" });
    } catch {
      // Device preparation should not hide Maestro's own diagnostics.
    }
  }
}

async function launchAndroidDevClient() {
  if (!hasAndroidEmulator) {
    return;
  }

  console.log("Launching Expo Dev Client with ADB.");

  execFileSync(
    "adb",
    [
      "shell",
      "am",
      "start",
      "-W",
      "-a",
      "android.intent.action.VIEW",
      "-d",
      devClientUrl,
      packageName,
    ],
    { stdio: "ignore" },
  );
  await delay(1000);
}

async function isMetroRunning() {
  try {
    const response = await fetch(`${metroUrl}/status`, {
      signal: AbortSignal.timeout(2000),
    });

    return (await response.text()).includes("packager-status:running");
  } catch {
    return false;
  }
}

async function waitForMetro() {
  const deadline = Date.now() + 60000;

  while (Date.now() < deadline) {
    if (await isMetroRunning()) {
      return;
    }

    await delay(1000);
  }

  throw new Error(`Timed out waiting for ${metroUrl}/status.`);
}

function spawnMetro() {
  console.log(`Starting Expo Dev Client Metro: ${metroUrl}`);
  const expoBin = resolve("node_modules/.bin/expo");

  return spawn(
    process.execPath,
    [expoBin, "start", "--dev-client", "--port", port, "--host", "lan"],
    {
      stdio: "inherit",
      env: process.env,
      detached: true,
    },
  );
}

function runMaestro() {
  console.log(`Maestro smoke using Metro URL: ${metroUrl}`);

  const maestro = spawn(
    "maestro",
    [
      "test",
      "-e",
      `EXPO_DEV_CLIENT_METRO_URL=${metroUrl}`,
      "-e",
      `EXPO_DEV_CLIENT_URL=${devClientUrl}`,
      ".maestro/smoke.yml",
    ],
    {
      stdio: "inherit",
      env: process.env,
    },
  );

  return new Promise((resolve, reject) => {
    maestro.on("error", reject);
    maestro.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`Maestro smoke exited by signal: ${signal}`));
        return;
      }

      resolve(code ?? 1);
    });
  });
}

async function waitForExit(child, timeoutMs) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }

  await new Promise((resolveWait) => {
    const timeout = setTimeout(resolveWait, timeoutMs);
    child.once("exit", () => {
      clearTimeout(timeout);
      resolveWait();
    });
  });
}

async function stopMetro(metro) {
  if (!metro?.pid || metro.killed) {
    return;
  }

  try {
    process.kill(-metro.pid, "SIGINT");
  } catch {
    metro.kill("SIGINT");
  }

  await waitForExit(metro, 5000);

  if (metro.exitCode === null && metro.signalCode === null) {
    try {
      process.kill(-metro.pid, "SIGTERM");
    } catch {
      metro.kill("SIGTERM");
    }

    await waitForExit(metro, 3000);
  }
}

async function main() {
  let metro;
  prepareAndroidEmulatorNetwork();
  prepareAndroidAppState();

  if (!(await isMetroRunning())) {
    metro = spawnMetro();
    await waitForMetro();
  }

  await launchAndroidDevClient();

  try {
    process.exitCode = await runMaestro();
  } finally {
    await stopMetro(metro);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
