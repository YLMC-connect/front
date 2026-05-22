import { spawn } from "node:child_process";
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
const metroUrl =
  process.env.EXPO_DEV_CLIENT_METRO_URL ?? `http://${getLanHost()}:${port}`;
const devClientUrl =
  process.env.EXPO_DEV_CLIENT_URL ??
  `exp+ylmc-connect://expo-development-client/?url=${encodeURIComponent(
    metroUrl,
  )}`;

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

  const maestro = spawn("maestro", ["test", ".maestro/smoke.yml"], {
    stdio: "inherit",
    env: {
      ...process.env,
      EXPO_DEV_CLIENT_METRO_URL: metroUrl,
      EXPO_DEV_CLIENT_URL: devClientUrl,
    },
  });

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

  if (!(await isMetroRunning())) {
    metro = spawnMetro();
    await waitForMetro();
  }

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
