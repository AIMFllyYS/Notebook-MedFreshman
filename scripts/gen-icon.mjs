// Generate Windows icons from SVG sources:
//   • build/icon.ico            ← app/icon.svg   (the website icon; used for the app/exe + shortcut)
//   • build/installer-icon.ico  ← build/logo.svg (a richer logo; used for the NSIS installer)
// sharp is a transitive (pnpm-isolated) Next dependency, so resolve it from the .pnpm store.
// ICOs are written PNG-embedded (Windows Vista+), which electron-builder consumes directly.
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const ROOT = process.cwd();

const pnpmDir = path.join(ROOT, "node_modules/.pnpm");
const sharpDir = readdirSync(pnpmDir).find((d) => /^sharp@/.test(d));
if (!sharpDir) {
  console.error("[gen-icon] sharp not found under node_modules/.pnpm — run pnpm install.");
  process.exit(1);
}
const sharp = require(path.join(pnpmDir, sharpDir, "node_modules/sharp"));

const SIZES = [16, 24, 32, 48, 64, 128, 256];

// Assemble a PNG-embedded .ico: 6-byte header + 16-byte dir entry per image + data.
function packIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type = icon
  header.writeUInt16LE(entries.length, 4);
  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + 16 * entries.length;
  entries.forEach(({ size, buf }, i) => {
    const b = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, b + 0); // width (0 means 256)
    dir.writeUInt8(size >= 256 ? 0 : size, b + 1); // height
    dir.writeUInt8(0, b + 2); // palette count
    dir.writeUInt8(0, b + 3); // reserved
    dir.writeUInt16LE(1, b + 4); // color planes
    dir.writeUInt16LE(32, b + 6); // bits per pixel
    dir.writeUInt32LE(buf.length, b + 8);
    dir.writeUInt32LE(offset, b + 12);
    offset += buf.length;
  });
  return Buffer.concat([header, dir, ...entries.map((e) => e.buf)]);
}

async function makeIco(srcSvg, outIco, outPng) {
  const svg = readFileSync(path.join(ROOT, srcSvg));
  // sharp rasterizes an SVG at (intrinsicWidth × density/72) before resizing, so pick a
  // density that yields a ≥1024px base regardless of the source's intrinsic size — crisp
  // downscales for a 512px logo and a 32px favicon alike.
  const m = svg.toString().match(/width="(\d+(?:\.\d+)?)"/);
  const intrinsic = m ? parseFloat(m[1]) : 512;
  const density = Math.min(2400, Math.max(72, Math.ceil((1024 / intrinsic) * 72)));
  const pngs = await Promise.all(
    SIZES.map((s) =>
      sharp(svg, { density }).resize(s, s, { fit: "cover" }).png({ compressionLevel: 9 }).toBuffer(),
    ),
  );
  const ico = packIco(SIZES.map((size, i) => ({ size, buf: pngs[i] })));
  writeFileSync(path.join(ROOT, outIco), ico);
  if (outPng) writeFileSync(path.join(ROOT, outPng), pngs[SIZES.indexOf(256)]);
  console.log(`[gen-icon] ${outIco} ← ${srcSvg} (density=${density}) = ${ico.length} bytes`);
}

await makeIco("app/icon.svg", "build/icon.ico", "build/icon.png"); // app / exe / shortcut icon = website icon
await makeIco("build/logo.svg", "build/installer-icon.ico", "build/installer-icon.png"); // installer icon
