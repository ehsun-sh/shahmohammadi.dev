/**
 * Turns a folder of rendered frames into the web-ready hero sequence.
 *
 *   npm run hero -- "D:/path/to/render/output"
 *   npm run hero -- "D:/path/to/render" --frames 120 --quality 70
 *
 * Outputs public/hero/w750/*.webp, public/hero/w1500/*.webp and a manifest,
 * all committed. They are generated, but they cannot be generated in CI: the
 * source renders are hundreds of megabytes and do not live in this repo. Same
 * arrangement as the icons and the font — regenerate locally, commit the result.
 *
 * WHY A FRAME SEQUENCE AND NOT THREE.JS
 * -------------------------------------
 * Three.js renders a *model*. What exists here is a finished render: the
 * lighting, the materials and the camera move are already baked, and they look
 * the way they look because a renderer took its time. Reproducing that in a
 * browser would mean exporting to glTF, rebuilding the materials against a
 * real-time approximation, and shipping ~150 KB gzipped of renderer to get a
 * worse-looking result that varies by GPU. The scroll budget is 50 KB of JS for
 * the whole page.
 *
 * Scrubbing a sequence on a canvas is ~2 KB, pixel-identical on every device,
 * and never drops a frame because it never renders anything — it blits.
 *
 * WHY NOT A VIDEO
 * ---------------
 * Smaller on the wire, and unreliable to scrub: seeking to a non-keyframe is
 * slow and jerky on iOS Safari, and encoding every frame as a keyframe to fix
 * that gives back most of the size advantage. A sequence is the boring choice
 * that always works.
 *
 * FRAME COUNT
 * -----------
 * The source is 200 frames at 24 fps, but playback here is driven by scroll
 * position, not by time — 24 fps is not a target, it is an artefact of how the
 * render was set up. Over a 250vh pin (~2000px of scroll on a laptop), 100
 * frames is one frame per 20px of scroll, which is smooth under any normal
 * scroll speed. Doubling to 200 doubles the payload to buy a step no one can
 * see. First and last frames are always kept, whatever the count.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'public', 'hero');

/** Mobile first, and the one that has to fit the budget. */
const WIDTHS = [750, 1500];
const READABLE = /\.(png|jpe?g|webp|tiff?|avif)$/i;

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : fallback;
};
const source = args.find((a) => !a.startsWith('--') && !Number.isFinite(Number(a)));

const TARGET_FRAMES = flag('frames', 100);
const QUALITY = flag('quality', 72);
/** CLAUDE.md hard constraint #3. Checked against the mobile set. */
const BUDGET_BYTES = 2 * 1024 * 1024;

if (!source) {
  console.error(
    'Usage: npm run hero -- <source-dir> [--frames 100] [--quality 72]\n\n' +
      'The source directory is the render output — the 200 numbered frames.\n' +
      'It is read, never written to, and does not need to be inside this repo.',
  );
  process.exit(1);
}

if (!fs.existsSync(source)) {
  console.error(`Source directory does not exist: ${source}`);
  process.exit(1);
}

/**
 * Natural sort on the number inside the filename. `frame10.png` must not sort
 * before `frame9.png`, and a renderer's padding is not something to rely on —
 * Blender pads, some exporters do not.
 */
const frames = fs
  .readdirSync(source)
  .filter((f) => READABLE.test(f))
  .map((f) => ({ file: f, n: Number(f.match(/(\d+)(?!.*\d)/)?.[1] ?? NaN) }))
  .sort((a, b) => (Number.isNaN(a.n) || Number.isNaN(b.n) ? a.file.localeCompare(b.file) : a.n - b.n));

if (frames.length === 0) {
  console.error(`No readable images in ${source}. Looked for ${READABLE}.`);
  process.exit(1);
}

/**
 * Evenly spaced pick that always includes the first and last frame. Dropping
 * either would mean the animation does not start where the render starts or
 * does not end on the closed enclosure, which is the one frame that has to be
 * exact — it is what the page settles on.
 */
const pick = (list, count) => {
  if (count >= list.length) return list;
  const step = (list.length - 1) / (count - 1);
  return Array.from({ length: count }, (_, i) => list[Math.round(i * step)]);
};

const selected = pick(frames, TARGET_FRAMES);

const first = await sharp(path.join(source, selected[0].file)).metadata();
const aspect = first.width / first.height;

console.log(
  `${frames.length} frames found, ${selected.length} kept ` +
    `(every ${(frames.length / selected.length).toFixed(1)}), ` +
    `source ${first.width}×${first.height}\n`,
);

fs.rmSync(OUT, { recursive: true, force: true });

const totals = {};

for (const width of WIDTHS) {
  const dir = path.join(OUT, `w${width}`);
  fs.mkdirSync(dir, { recursive: true });
  let bytes = 0;

  for (const [i, frame] of selected.entries()) {
    const target = path.join(dir, `${String(i).padStart(3, '0')}.webp`);
    await sharp(path.join(source, frame.file))
      .resize({ width, withoutEnlargement: true })
      // `effort: 6` is slow to encode and 8–12% smaller than the default. This
      // runs once per render, and every visitor pays for the bytes.
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(target);
    bytes += fs.statSync(target).size;
    if (i % 25 === 0) process.stdout.write(`  w${width}: ${i + 1}/${selected.length}\r`);
  }

  totals[width] = bytes;
  const mb = (bytes / 1024 / 1024).toFixed(2);
  const per = Math.round(bytes / selected.length / 1024);
  console.log(`  w${width}: ${selected.length} frames, ${mb} MB total, ~${per} KB each`);
}

/**
 * The poster is the last frame: the finished product, enclosure closed. It is
 * what someone sees with JavaScript off, with reduced motion on, and in the
 * moment before the sequence has downloaded — so it has to be the frame that
 * says the most on its own, which is the end of the story, not the start.
 */
const poster = path.join(OUT, 'poster.webp');
await sharp(path.join(source, selected.at(-1).file))
  .resize({ width: 1500, withoutEnlargement: true })
  .webp({ quality: 82, effort: 6 })
  .toFile(poster);

const manifest = {
  count: selected.length,
  widths: WIDTHS,
  aspect: Number(aspect.toFixed(4)),
  quality: QUALITY,
  sourceFrames: frames.length,
  generated: new Date().toISOString().slice(0, 10),
};
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

const mobile = totals[WIDTHS[0]];
console.log(
  `\n  poster.webp: ${(fs.statSync(poster).size / 1024).toFixed(0)} KB` +
    `\n  manifest.json written\n`,
);

if (mobile > BUDGET_BYTES) {
  console.error(
    `Mobile set is ${(mobile / 1024 / 1024).toFixed(2)} MB, over the 2 MB hero budget ` +
      `in CLAUDE.md.\nDrop --frames or --quality and run again. At ${selected.length} ` +
      `frames the ceiling is ~${Math.floor(BUDGET_BYTES / selected.length / 1024)} KB a frame.`,
  );
  process.exit(1);
}

console.log(
  `Mobile set is ${(mobile / 1024 / 1024).toFixed(2)} MB of the 2 MB budget. ` +
    `Commit public/hero/.`,
);
