import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { buildDesignRouteRows } from "./design-screen-routes.mjs";

const originalRoot =
  process.env.YLMC_ORIGINAL_SCREENSHOT_DIR ??
  "/private/tmp/ylmc-golden-screens/2026-05-23/original";
const appRoot =
  process.env.YLMC_APP_SCREENSHOT_PNG_DIR ??
  "/private/tmp/ylmc-golden-screens/2026-05-23/app";
const outputRoot =
  process.env.YLMC_VISUAL_COMPARE_DIR ??
  "/private/tmp/ylmc-golden-screens/2026-05-23/compare";
const normalizedRoot = path.join(outputRoot, "normalized");
const targetWidth = Number(process.env.YLMC_VISUAL_COMPARE_WIDTH ?? "360");
const targetHeight = Number(process.env.YLMC_VISUAL_COMPARE_HEIGHT ?? "720");

const run = (command, args) =>
  execFileSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();

const getImageSize = (imagePath) => {
  const output = run("sips", [
    "-g",
    "pixelWidth",
    "-g",
    "pixelHeight",
    imagePath,
  ]);
  const width = Number(output.match(/pixelWidth:\s*(\d+)/)?.[1]);
  const height = Number(output.match(/pixelHeight:\s*(\d+)/)?.[1]);

  if (!width || !height) {
    throw new Error(`Could not read image size: ${imagePath}`);
  }

  return { width, height };
};

const normalizeImage = (imagePath, destinationBmp, options = {}) => {
  mkdirSync(path.dirname(destinationBmp), { recursive: true });

  let sourcePath = imagePath;

  if (options.cropAppScreenshot) {
    const { width, height } = getImageSize(imagePath);
    const expectedHeight = Math.round(width * (targetHeight / targetWidth));

    if (height > expectedHeight) {
      const croppedPath = `${destinationBmp}.crop.png`;
      run("sips", [
        "--cropToHeightWidth",
        String(expectedHeight),
        String(width),
        imagePath,
        "--out",
        croppedPath,
      ]);
      sourcePath = croppedPath;
    }
  }

  run("sips", [
    "-s",
    "format",
    "bmp",
    "-z",
    String(targetHeight),
    String(targetWidth),
    sourcePath,
    "--out",
    destinationBmp,
  ]);
};

const readBmpPixels = (bmpPath) => {
  const buffer = readFileSync(bmpPath);

  if (buffer.toString("ascii", 0, 2) !== "BM") {
    throw new Error(`Unsupported BMP header: ${bmpPath}`);
  }

  const offset = buffer.readUInt32LE(10);
  const width = buffer.readInt32LE(18);
  const rawHeight = buffer.readInt32LE(22);
  const bitDepth = buffer.readUInt16LE(28);
  const compression = buffer.readUInt32LE(30);
  const height = Math.abs(rawHeight);

  const supportedCompression =
    compression === 0 || (bitDepth === 32 && compression === 3);

  if (![24, 32].includes(bitDepth) || !supportedCompression) {
    throw new Error(
      `Unsupported BMP format (${bitDepth}bpp, compression=${compression}): ${bmpPath}`,
    );
  }

  const bytesPerPixel = bitDepth / 8;
  const stride = Math.floor((bitDepth * width + 31) / 32) * 4;
  const pixels = new Uint8Array(width * height * 3);
  let cursor = 0;

  for (let y = 0; y < height; y += 1) {
    const sourceY = rawHeight > 0 ? height - 1 - y : y;
    const rowStart = offset + sourceY * stride;

    for (let x = 0; x < width; x += 1) {
      const pixelStart = rowStart + x * bytesPerPixel;
      pixels[cursor] = buffer[pixelStart + 2];
      pixels[cursor + 1] = buffer[pixelStart + 1];
      pixels[cursor + 2] = buffer[pixelStart];
      cursor += 3;
    }
  }

  return { width, height, pixels };
};

const compareBmps = (originalBmp, appBmp) => {
  const original = readBmpPixels(originalBmp);
  const app = readBmpPixels(appBmp);

  if (original.width !== app.width || original.height !== app.height) {
    throw new Error(
      `Normalized image sizes differ: ${originalBmp} vs ${appBmp}`,
    );
  }

  let totalDiff = 0;
  let over25 = 0;
  let over50 = 0;
  const pixelCount = original.width * original.height;

  for (let i = 0; i < original.pixels.length; i += 3) {
    const diff =
      (Math.abs(original.pixels[i] - app.pixels[i]) +
        Math.abs(original.pixels[i + 1] - app.pixels[i + 1]) +
        Math.abs(original.pixels[i + 2] - app.pixels[i + 2])) /
      3;

    totalDiff += diff;

    if (diff > 25) {
      over25 += 1;
    }

    if (diff > 50) {
      over50 += 1;
    }
  }

  return {
    meanDiff: Number((totalDiff / pixelCount).toFixed(2)),
    over25Ratio: Number((over25 / pixelCount).toFixed(4)),
    over50Ratio: Number((over50 / pixelCount).toFixed(4)),
  };
};

const getPixelRange = (bmpPath) => {
  const { pixels } = readBmpPixels(bmpPath);
  let min = 255;
  let max = 0;

  for (const value of pixels) {
    min = Math.min(min, value);
    max = Math.max(max, value);
  }

  return max - min;
};

const main = () => {
  const rows = buildDesignRouteRows();
  rmSync(normalizedRoot, { recursive: true, force: true });
  mkdirSync(normalizedRoot, { recursive: true });

  const results = rows.map((row) => {
    const originalScreenshot = path.join(originalRoot, row.screenshotName);
    const appScreenshot = path.join(appRoot, row.screenshotName);

    if (!existsSync(originalScreenshot) || !existsSync(appScreenshot)) {
      return {
        ...row,
        originalScreenshot,
        appScreenshot,
        missing: true,
      };
    }

    const originalBmp = path.join(
      normalizedRoot,
      `${row.section}__${row.id}__original.bmp`,
    );
    const appBmp = path.join(
      normalizedRoot,
      `${row.section}__${row.id}__app.bmp`,
    );

    normalizeImage(originalScreenshot, originalBmp);
    normalizeImage(appScreenshot, appBmp, { cropAppScreenshot: true });

    const originalPixelRange = getPixelRange(originalBmp);

    return {
      ...row,
      originalScreenshot,
      appScreenshot,
      missing: false,
      originalFlat: originalPixelRange < 8,
      originalPixelRange,
      ...compareBmps(originalBmp, appBmp),
    };
  });

  const sorted = [...results].sort((a, b) => {
    if (a.missing && !b.missing) {
      return -1;
    }

    if (!a.missing && b.missing) {
      return 1;
    }

    return (b.meanDiff ?? 0) - (a.meanDiff ?? 0);
  });

  writeFileSync(
    path.join(outputRoot, "visual-compare-report.json"),
    `${JSON.stringify(sorted, null, 2)}\n`,
  );

  const tsv = [
    "section\tid\tcomponent\tvariant\troute\tmeanDiff\tover25Ratio\tover50Ratio\toriginalFlat\toriginalPixelRange\toriginalScreenshot\tappScreenshot",
    ...sorted.map((row) =>
      [
        row.section,
        row.id,
        row.component,
        row.variant,
        row.route,
        row.meanDiff ?? "missing",
        row.over25Ratio ?? "missing",
        row.over50Ratio ?? "missing",
        row.originalFlat ? "yes" : "no",
        row.originalPixelRange ?? "missing",
        row.originalScreenshot,
        row.appScreenshot,
      ].join("\t"),
    ),
  ].join("\n");
  writeFileSync(path.join(outputRoot, "visual-compare-report.tsv"), `${tsv}\n`);

  const missing = sorted.filter((row) => row.missing);
  const comparable = sorted.filter((row) => !row.missing);

  console.log(`screens=${rows.length}`);
  console.log(`missing=${missing.length}`);
  console.log(`output=${outputRoot}`);

  for (const row of comparable.slice(0, 20)) {
    console.log(
      [
        row.section,
        row.id,
        row.route,
        `mean=${row.meanDiff}`,
        `over25=${row.over25Ratio}`,
        row.originalFlat ? "original=flat" : "original=rendered",
      ].join("\t"),
    );
  }

  if (missing.length > 0) {
    process.exitCode = 1;
  }
};

main();
