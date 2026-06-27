import { spawn } from "node:child_process";

const port = Number(process.env.EXPO_SMOKE_PORT ?? 8081);
const timeoutMs = Number(process.env.EXPO_SMOKE_TIMEOUT_MS ?? 45000);
const statusUrl = `http://localhost:${port}/status`;
const args = [
  "expo",
  "start",
  "--dev-client",
  "--port",
  String(port),
  "--localhost",
];

const child = spawn("npx", args, {
  cwd: process.cwd(),
  env: {
    ...process.env,
    EXPO_NO_TELEMETRY: "1",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let output = "";

const appendOutput = (chunk) => {
  output += chunk.toString();
};

child.stdout.on("data", appendOutput);
child.stderr.on("data", appendOutput);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForMetro() {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(statusUrl);
      if (response.ok) {
        return;
      }
    } catch {
      // Metro may still be starting.
    }

    if (child.exitCode !== null) {
      throw new Error(`Expo process exited before Metro responded.\n${output}`);
    }

    await sleep(1000);
  }

  throw new Error(`Timed out waiting for ${statusUrl}.\n${output}`);
}

async function stopChild() {
  if (child.exitCode !== null) return;

  child.kill("SIGINT");
  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    sleep(3000).then(() => child.kill("SIGTERM")),
  ]);
}

try {
  await waitForMetro();
  console.log(`Dev Client Metro smoke passed: ${statusUrl}`);
  await stopChild();
} catch (error) {
  await stopChild();
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
