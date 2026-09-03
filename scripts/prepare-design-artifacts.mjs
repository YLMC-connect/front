import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

const defaultZipPath = path.join(
  os.homedir(),
  "Downloads",
  "열린문커넥트.zip",
);
const defaultOutputRoot = path.join(
  os.tmpdir(),
  "ylmc-golden-screens",
  "2026-05-23",
);
const zipPath = process.env.YLMC_DESIGN_ZIP_PATH ?? defaultZipPath;
const outputRoot = process.env.YLMC_DESIGN_ARTIFACT_ROOT ?? defaultOutputRoot;
const originalRoot = path.join(outputRoot, "original");
const sourceRoot = path.join(outputRoot, "source");
const inventoryPath = path.join(outputRoot, "inventory.json");
const manifestPath = path.join(originalRoot, "manifest.json");
const renderOriginals = process.env.YLMC_PREPARE_ORIGINALS !== "0";
const width = 360;
const height = 720;
const renderSettleMs = Number(
  process.env.YLMC_PREPARE_RENDER_SETTLE_MS ?? "320",
);

const extraScreens = [
  {
    sectionId: "me",
    section: "me",
    id: "my-wishlist",
    component: "ScreenMyWishlist",
  },
  {
    sectionId: "me",
    section: "me",
    id: "notif-settings",
    component: "ScreenNotifSettings",
  },
  { sectionId: "me", section: "me", id: "support", component: "ScreenSupport" },
  { sectionId: "me", section: "me", id: "inquiry", component: "ScreenInquiry" },
  { sectionId: "me", section: "me", id: "account", component: "ScreenAccount" },
];

const run = (command, args) =>
  execFileSync(command, args, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });

const extractZipText = (entry) =>
  run("bsdtar", ["-xOf", zipPath, entry]).replace(/\r\n/g, "\n");

const extractStandaloneHtml = (destination) => {
  const entries = run("bsdtar", ["-tf", zipPath]).split("\n");
  const standaloneEntry = entries.find((entry) =>
    entry.normalize("NFC").endsWith("커넥트.html"),
  );

  if (!standaloneEntry) {
    throw new Error("Could not find standalone design HTML in ZIP.");
  }

  writeFileSync(destination, extractZipText(standaloneEntry));
};

const buildInventory = () => {
  const appSource = extractZipText("app.jsx");
  const rows = [];
  let currentSection = "";
  const pattern =
    /<DCSection\s+id="([^"]+)"|<DCArtboard\s+id="([^"]+)"[\s\S]*?><([A-Z][A-Za-z0-9]*)(?:\s+variant="([^"]+)")?/g;
  let match;

  while ((match = pattern.exec(appSource))) {
    if (match[1]) {
      currentSection = match[1];
      continue;
    }

    rows.push({
      sectionId: currentSection,
      section: currentSection,
      id: match[2],
      component: match[3],
      variant: match[4] ?? "",
    });
  }

  for (const screen of extraScreens) {
    if (!rows.some((row) => row.id === screen.id)) {
      rows.push({ variant: "", ...screen });
    }
  }

  return rows;
};

const makeManifest = (rows) =>
  rows.map((row, index) => ({
    id: row.id,
    filename: `${String(index + 1).padStart(3, "0")}-${row.id}.png`,
  }));

const getFreePort = () =>
  new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
    server.on("error", reject);
  });

const requestJson = (port, requestPath, method = "GET") =>
  new Promise((resolve, reject) => {
    const request = http.request(
      { host: "127.0.0.1", port, path: requestPath, method },
      (response) => {
        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        });
      },
    );
    request.on("error", reject);
    request.end();
  });

const waitForDevTools = async (port) => {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      await requestJson(port, "/json/version");
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  throw new Error("Chrome DevTools endpoint did not start.");
};

const createCdp = async (port) => {
  const target = await requestJson(port, "/json/new", "PUT");
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  const waiters = new Map();
  let nextId = 0;

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && waiters.has(message.id)) {
      waiters.get(message.id)(message);
      waiters.delete(message.id);
    }
  };

  return {
    send(method, params = {}) {
      return new Promise((resolve) => {
        const id = ++nextId;
        waiters.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    },
    close() {
      ws.close();
    },
  };
};

const findChrome = () => {
  const envPath = process.env.CHROME_BIN;

  if (envPath && existsSync(envPath)) {
    return envPath;
  }

  const macChrome =
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (existsSync(macChrome)) {
    return macChrome;
  }

  for (const binary of ["google-chrome", "chromium", "chromium-browser"]) {
    try {
      return run("which", [binary]).trim();
    } catch {
      // Try the next known binary.
    }
  }

  throw new Error("Chrome/Chromium is required to render design originals.");
};

const renderOriginalScreens = async (rows, manifest, standaloneHtmlPath) => {
  const chrome = findChrome();
  const port = await getFreePort();
  const userDataDir = path.join(outputRoot, ".chrome-profile");
  const chromeProcess = spawn(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${userDataDir}`,
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  try {
    await waitForDevTools(port);
    const cdp = await createCdp(port);

    try {
      await cdp.send("Page.enable");
      await cdp.send("Runtime.enable");
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await cdp.send("Page.navigate", {
        url: `file://${standaloneHtmlPath}`,
      });

      for (let attempt = 0; attempt < 80; attempt += 1) {
        const result = await cdp.send("Runtime.evaluate", {
          expression:
            "typeof React !== 'undefined' && typeof ReactDOM !== 'undefined' && typeof ScreenLogin === 'function' && typeof ScreenMyWishlist === 'function'",
          returnByValue: true,
        });

        if (result.result.result?.value) {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 250));

        if (attempt === 79) {
          throw new Error(
            "Timed out waiting for standalone design components.",
          );
        }
      }

      for (const [index, row] of rows.entries()) {
        const filename = manifest[index].filename;
        const destination = path.join(originalRoot, filename);
        const props = row.variant
          ? `{ variant: ${JSON.stringify(row.variant)} }`
          : "{}";
        const expression = `
          (async () => {
            if (window.__ylmcRoot) window.__ylmcRoot.unmount();
            document.body.innerHTML = '<div id="shot"></div>';
            document.documentElement.style.cssText = 'margin:0;width:${width}px;height:${height}px;overflow:hidden;background:#f0eee9';
            document.body.style.cssText = 'margin:0;width:${width}px;height:${height}px;overflow:hidden;background:#f0eee9';
            const Component = window[${JSON.stringify(row.component)}];
            if (typeof Component !== 'function') throw new Error('Missing component: ${row.component}');
            const root = document.getElementById('shot');
            root.style.cssText = 'width:${width}px;height:${height}px;overflow:hidden';
            window.__ylmcRoot = ReactDOM.createRoot(root);
            window.__ylmcRoot.render(React.createElement(Component, ${props}));
            await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            await new Promise((resolve) => setTimeout(resolve, ${renderSettleMs}));
            return true;
          })()
        `;
        const renderResult = await cdp.send("Runtime.evaluate", {
          expression,
          awaitPromise: true,
          returnByValue: true,
        });

        if (renderResult.result.exceptionDetails) {
          throw new Error(
            `Could not render ${row.id}: ${renderResult.result.exceptionDetails.text}`,
          );
        }

        const screenshot = await cdp.send("Page.captureScreenshot", {
          format: "png",
          fromSurface: true,
          clip: { x: 0, y: 0, width, height, scale: 1 },
        });
        writeFileSync(
          destination,
          Buffer.from(screenshot.result.data, "base64"),
        );
        console.log(`${index + 1}/${rows.length} ${row.id} -> ${destination}`);
      }
    } finally {
      cdp.close();
    }
  } finally {
    chromeProcess.kill();
  }
};

const main = async () => {
  mkdirSync(outputRoot, { recursive: true });
  mkdirSync(originalRoot, { recursive: true });
  mkdirSync(sourceRoot, { recursive: true });

  const rows = buildInventory();
  const manifest = makeManifest(rows);
  const standaloneHtmlPath = path.join(sourceRoot, "standalone.html");

  writeFileSync(inventoryPath, `${JSON.stringify(rows, null, 2)}\n`);
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  extractStandaloneHtml(standaloneHtmlPath);

  if (renderOriginals) {
    await renderOriginalScreens(rows, manifest, standaloneHtmlPath);
  }

  console.log(`screens=${rows.length}`);
  console.log(`inventory=${inventoryPath}`);
  console.log(`manifest=${manifestPath}`);
  console.log(`original=${originalRoot}`);
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
