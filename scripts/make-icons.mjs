/**
 * Regenerates the favicon set from src/assets/brand/logo.svg.
 *
 *   npm run icons
 *
 * Run it whenever the mark changes. The outputs are committed — this is not a
 * build step, because they change roughly never and a browser asking for
 * /favicon.ico during `astro dev` should not depend on a generator having run.
 *
 * The mark is drawn light on the brand ink rather than transparent. App icons
 * land on surfaces this repo does not control — an iOS home screen composites
 * transparency to black, and a bare dark silhouette disappears into a dark
 * browser tab strip. A solid plate is the only version that holds everywhere.
 */
import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src', 'assets', 'brand', 'logo.svg');
const OUT = path.join(ROOT, 'public');

const INK = '#1D1D1F'; // --color-text, the plate
const MARK = '#FBFBFD'; // --color-bg, the monogram

/**
 * The monogram sits at ~11% inset inside its own viewBox, which is right for a
 * mark floating in a layout and too tight for one filling a rounded app icon.
 * Scaling it down inside a larger canvas gives the plate a real margin.
 */
const PAD = 0.16;

function iconSvg() {
  const inner = fs
    .readFileSync(SRC, 'utf8')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<svg[^>]*>/, '')
    .replace('</svg>', '')
    .trim();

  const scale = 1 - PAD * 2;
  const offset = 1000 * PAD;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
  <rect width="1000" height="1000" fill="${INK}"/>
  <g transform="translate(${offset} ${offset}) scale(${scale})" fill="${MARK}" fill-rule="evenodd" clip-rule="evenodd">${inner}</g>
</svg>`;
}

const svg = iconSvg();

const png = (size) =>
  Buffer.from(
    new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng(),
  );

/**
 * ICO container. Every entry is a PNG payload, which every browser back to IE11
 * reads and which keeps a six-size icon at a few KB instead of a few hundred.
 * Sizes of 256 are written as 0 in the directory — the field is one byte.
 */
function ico(sizes) {
  const images = sizes.map((size) => ({ size, data: png(size) }));
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const written = [];
function write(name, buffer) {
  fs.writeFileSync(path.join(OUT, name), buffer);
  written.push(`${name.padEnd(22)} ${String(buffer.length).padStart(7)} bytes`);
}

write('favicon.ico', ico([16, 32, 48, 64, 128, 256]));
write('apple-touch-icon.png', png(180));
write('icon-192.png', png(192));
write('icon-512.png', png(512));

console.log(written.join('\n'));
