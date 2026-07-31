// Resizes + converts everything in assets/design/ to web-ready .webp.
// Run this after dropping new portfolio images in, before deploying —
// design.js will pick up the resulting .webp files automatically.
//
// Usage: npm run optimize:design
//
// - Caps the longest edge at MAX_DIMENSION (never upscales).
// - Converts to WebP at QUALITY — usually 25-50% smaller than an
//   equivalent JPEG/PNG, and every current browser supports it.
// - Originals are moved to assets/design/_originals/ (gitignored) rather
//   than deleted, in case you want the source file back later.
// - Skips files that are already .webp, and non-image files (README.md,
//   .DS_Store, raw camera formats like .DNG that sharp/browsers can't
//   read as an image).

import { readdir, mkdir, rename, stat } from "node:fs/promises";
import { join, extname, basename } from "node:path";
import sharp from "sharp";

const DESIGN_DIR = new URL("../assets/design/", import.meta.url).pathname;
const ORIGINALS_DIR = join(DESIGN_DIR, "_originals");
const MAX_DIMENSION = 2000;
const QUALITY = 82;
const RASTER_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);

function formatKB(bytes) {
  return `${(bytes / 1024).toFixed(0)}KB`;
}

async function main() {
  const entries = await readdir(DESIGN_DIR, { withFileTypes: true });
  const candidates = entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => RASTER_EXTENSIONS.has(extname(name).toLowerCase()));

  if (candidates.length === 0) {
    console.log("No .jpg/.jpeg/.png files to optimize in assets/design/.");
    return;
  }

  await mkdir(ORIGINALS_DIR, { recursive: true });

  for (const name of candidates) {
    const srcPath = join(DESIGN_DIR, name);
    const backupPath = join(ORIGINALS_DIR, name);
    const outName = `${basename(name, extname(name))}.webp`;
    const outPath = join(DESIGN_DIR, outName);

    const before = (await stat(srcPath)).size;

    await rename(srcPath, backupPath);

    await sharp(backupPath)
      .resize(MAX_DIMENSION, MAX_DIMENSION, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: QUALITY })
      .toFile(outPath);

    const after = (await stat(outPath)).size;
    const pct = (100 * (1 - after / before)).toFixed(0);
    console.log(`${name} -> ${outName}: ${formatKB(before)} -> ${formatKB(after)} (-${pct}%)`);
  }

  console.log(`\nOriginals backed up to assets/design/_originals/ (gitignored).`);
}

main();
