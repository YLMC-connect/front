import { spawn } from "node:child_process";
import { networkInterfaces } from "node:os";

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

console.log(`Maestro smoke using Metro URL: ${metroUrl}`);

const maestro = spawn("maestro", ["test", ".maestro/smoke.yml"], {
  stdio: "inherit",
  env: {
    ...process.env,
    EXPO_DEV_CLIENT_METRO_URL: metroUrl,
    EXPO_DEV_CLIENT_URL: devClientUrl,
  },
});

maestro.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});

maestro.on("exit", (code, signal) => {
  if (signal) {
    console.error(`Maestro smoke exited by signal: ${signal}`);
    process.exitCode = 1;
    return;
  }

  process.exitCode = code ?? 1;
});
