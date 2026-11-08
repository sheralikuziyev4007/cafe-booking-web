#!/usr/bin/env node
/**
 * Turns a photo into the two WebP files the menu uses.
 *
 *   npm install --no-save sharp
 *   node scripts/menu-photo.mjs <source image> <name> [focus]
 *
 * The photo is cropped to 3:2 like the other menu cards. For a tall photo, `focus` (0 = top, 1 = bottom,
 * default 0.5) says which part of the picture to keep. Example for a tall photo with the dish in the upper part:
 *   node scripts/menu-photo.mjs ~/Downloads/tiramisu.webp tiramisu 0.44
 * Creates public/images/<name>.webp (800x533) and public/images/<name>-w400.webp (400x267).
 * Then make sure src/data/responsiveImages.ts has: <name>: { width: 800, variants: [400] }
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [source, name, focusArg = "0.5"] = process.argv.slice(2);
const focus = Number(focusArg);
if (!source || !name || !/^[a-z0-9-]+$/.test(name)) {
  console.error("Usage: node scripts/menu-photo.mjs <source image> <name>   (name: lowercase letters, digits, dashes)");
  process.exit(1);
}
if (!Number.isFinite(focus) || focus < 0 || focus > 1) {
  console.error("focus must be a number from 0 (top) to 1 (bottom)");
  process.exit(1);
}
if (!existsSync(source)) {
  console.error(`File not found: ${source}`);
  process.exit(1);
}

let sharp;
try {
  ({ default: sharp } = await import("sharp"));
} catch {
  console.error("The 'sharp' package is missing. Run: npm install --no-save sharp");
  process.exit(1);
}

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "images");
const SIZES = [
  { file: `${name}.webp`, width: 800, height: 533 },
  { file: `${name}-w400.webp`, width: 400, height: 267 },
];

// Crop to 3:2 around the chosen focus ourselves: automatic cropping can pick the wrong part of a photo
const { data, info } = await sharp(source).rotate().toBuffer({ resolveWithObject: true });
const ratio = 3 / 2;
const cropWidth = Math.min(info.width, Math.round(info.height * ratio));
const cropHeight = Math.min(info.height, Math.round(info.width / ratio));
const crop = {
  left: Math.round((info.width - cropWidth) / 2),
  top: Math.max(0, Math.min(info.height - cropHeight, Math.round(info.height * focus - cropHeight / 2))),
  width: cropWidth,
  height: cropHeight,
};

for (const { file, width, height } of SIZES) {
  const target = path.join(outDir, file);
  await sharp(data).extract(crop).resize(width, height).webp({ quality: 80 }).toFile(target);
  console.log(`created public/images/${file}`);
}
