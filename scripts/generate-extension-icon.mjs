/**
 * Generates the Chrome extension icon PNG from the SVG source.
 * Run once: node scripts/generate-extension-icon.mjs
 * Requires: npm install -D sharp
 */
import sharp from "sharp";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = resolve(__dirname, "../public/kooma-icon.svg");
const outPath = resolve(__dirname, "../extension/icons/icon-48.png");

const svg = readFileSync(svgPath);

await sharp(svg).resize(48, 48).png().toFile(outPath);

console.log("✓ extension/icons/icon-48.png generated");
