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
const WIDTHS = [720, 1440];
const READABLE = /\.(png|jpe?g|webp|tiff?|avif)$/i;

/**
 * The mobile set is encoded harder than the desktop one. It is displayed at
 * roughly half the size, so the same artefacts are half as visible, and it is
 * the set that has to fit inside 2 MB.
 */
const QUALITY_STEP_DOWN = 10;

/** Alpha above this counts as "object here" when measuring the crop. */
const ALPHA_FLOOR = 8;
/**
 * Fraction of frames the crop must contain whole, or 1 to skip cropping.
 *
 * OFF BY DEFAULT, and that is the conclusion of having shipped it on.
 *
 * The idea was that trimming the transparent margin would buy payload. It does
 * not: transparent pixels are nearly free in WebP, and the same frame measured
 * ~29 KB cropped and ~29 KB whole. Frame count is the only real lever on
 * payload. What cropping actually buys is composition — a bigger subject on
 * screen — and it charges for that in correctness.
 *
 * The charge is this. A strict union is the wrong rule for an exploded
 * assembly: the parts fly in from outside the frame, so in a handful of frames
 * a panel sweeps across the canvas and touches every edge, which makes the
 * union the whole canvas and reclaims nothing. Loosening it to a percentile
 * reclaims area by letting the outliers bleed — which is to say by clipping
 * the very parts whose arrival is the point of those frames.
 *
 * So it is opt-in. `--contain 0.9` restores the old behaviour if a particular
 * render genuinely needs it; the note above is what to weigh first.
 */
const DEFAULT_CONTAIN = 1;
/** Breathing room left around the union box, as a fraction of its size. */
const CROP_PADDING = 0.02;
/** Width the bounding box is measured at. Full resolution is not needed to
 *  find an edge, and 200 full-size PNGs would take minutes to scan. */
const PROBE_WIDTH = 240;

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : fallback;
};
const source = args.find((a) => !a.startsWith('--') && !Number.isFinite(Number(a)));

const TARGET_FRAMES = flag('frames', 100);
const QUALITY = flag('quality', 72);
const CONTAIN = flag('contain', DEFAULT_CONTAIN);

/**
 * A camera push, applied at draw time rather than baked into the pixels.
 *
 * One crop box has to hold two very different framings — a square top-down
 * board at the start and a wide, flat, front-on enclosure at the end — so
 * whichever box is chosen wastes space at one end or the other. It wastes it at
 * the end: the finished product occupies about a fifth of the frame's height,
 * and that is the frame the page comes to rest on.
 *
 * Scaling the drawn frame up as the sequence runs fixes it without touching the
 * render and without costing a byte. It also matches the story the animation is
 * telling — the camera comes to the front of the device — so it reads as the
 * shot finishing rather than as a correction. Frames wide enough to bleed are
 * clipped by the stage, which already hides its overflow.
 *
 * OFF BY DEFAULT. It ran at 1 -> 1.5 for one build and the result was visibly
 * soft, because it scales up pixels that have already been scaled down to the
 * output width — blur on top of blur. The empty space it was compensating for
 * turned out to be correct anyway: the camera orbits from above to head-on, so
 * the subject genuinely occupies less of a head-on frame, and shrinking that
 * gap fights the shot rather than finishing it.
 *
 * `--zoom-end 1.4` brings it back for a render that needs it. If the last frame
 * is too loose, the fix is the camera, not this.
 */
const ZOOM_START = flag('zoom-start', 1);
const ZOOM_END = flag('zoom-end', 1);
/** CLAUDE.md hard constraint #3. Checked against the mobile set. */
const BUDGET_BYTES = 2 * 1024 * 1024;

if (!source) {
  console.error(
    'Usage: npm run hero -- <source-dir> [--frames 100] [--quality 72] [--contain 0.9]\n\n' +
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

console.log(
  `${frames.length} frames found, ${selected.length} kept ` +
    `(every ${(frames.length / selected.length).toFixed(1)}), ` +
    `source ${first.width}×${first.height}` +
    `${first.hasAlpha ? ', transparent' : ', opaque'}\n`,
);

/**
 * The union of every frame's alpha bounding box.
 *
 * A render arrives with the object floating in a canvas sized for the widest
 * moment of the camera move, so most frames are largely empty. That emptiness
 * is not free: it is encoded, downloaded and decoded a hundred times, and it
 * shrinks the object on screen because `object-fit: contain` fits the canvas,
 * not the thing in it.
 *
 * The union — not a per-frame crop — is what keeps the animation registered.
 * Cropping each frame to its own contents would re-centre the object every
 * frame and the whole sequence would jitter. One rectangle for all of them
 * removes the dead space that no frame ever uses and moves nothing.
 *
 * Measured on a downscale, then scaled back up with padding. Finding an edge
 * does not need full resolution, and scanning 200 full-size PNGs would take
 * minutes to answer a question a thumbnail answers.
 */
async function unionBox(files) {
  const boxes = [];
  let scale = 1;

  for (const [i, frame] of files.entries()) {
    const { data, info } = await sharp(path.join(source, frame.file))
      .ensureAlpha()
      .resize({ width: PROBE_WIDTH })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width: w, height: h, channels } = info;
    let minX = w, minY = h, maxX = -1, maxY = -1;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * channels + channels - 1] <= ALPHA_FLOOR) continue;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }

    if (maxX < 0) continue; // fully transparent frame, nothing to contribute
    scale = first.width / w;
    boxes.push({ index: i, minX, minY, maxX, maxY });

    if (i % 25 === 0) process.stdout.write(`  measuring crop: ${i + 1}/${files.length}\r`);
  }

  if (boxes.length === 0) return null;

  /**
   * The value that leaves at most `(1 - CONTAIN)` of frames outside, on one
   * edge. `dir` is which end of the sorted list is "outward" for that edge.
   */
  const cut = (key, dir) => {
    const values = boxes.map((b) => b[key]).sort((a, b) => a - b);
    const slack = Math.floor(values.length * (1 - CONTAIN));
    return dir < 0 ? values[slack] : values[values.length - 1 - slack];
  };

  // Whatever the percentile says, the first and last frames are never cut: the
  // page rests on both of them. Frame 0 is what a visitor sees before they
  // scroll, and the last frame is the poster, the finished product, and the
  // thing the whole sequence is travelling towards.
  const anchors = [boxes[0], boxes.at(-1)];

  const box = {
    minX: Math.min(cut('minX', -1), ...anchors.map((b) => b.minX)),
    minY: Math.min(cut('minY', -1), ...anchors.map((b) => b.minY)),
    maxX: Math.max(cut('maxX', +1), ...anchors.map((b) => b.maxX)),
    maxY: Math.max(cut('maxY', +1), ...anchors.map((b) => b.maxY)),
  };

  const bled = boxes.filter(
    (b) =>
      b.minX < box.minX || b.minY < box.minY || b.maxX > box.maxX || b.maxY > box.maxY,
  ).length;

  const padX = (box.maxX - box.minX + 1) * scale * CROP_PADDING;
  const padY = (box.maxY - box.minY + 1) * scale * CROP_PADDING;
  const left = Math.max(0, Math.round(box.minX * scale - padX));
  const top = Math.max(0, Math.round(box.minY * scale - padY));

  return {
    left,
    top,
    width: Math.min(first.width - left, Math.round((box.maxX + 1) * scale + padX) - left),
    height: Math.min(first.height - top, Math.round((box.maxY + 1) * scale + padY) - top),
    bled,
    total: boxes.length,
  };
}

// `CONTAIN >= 1` means no crop at all, not a strict union: on this render a
// strict union is the whole canvas anyway, and skipping the pass saves scanning
// every frame's alpha to arrive at that answer.
const crop = first.hasAlpha && CONTAIN < 1 ? await unionBox(selected) : null;

if (!crop) {
  console.log(`  crop: off — frames are written at the full ${first.width}×${first.height}\n`);
}

if (crop) {
  const kept = ((crop.width * crop.height) / (first.width * first.height)) * 100;
  console.log(
    `  crop: ${crop.width}×${crop.height} at (${crop.left},${crop.top}) — ` +
      `${(100 - kept).toFixed(0)}% of the canvas dropped, ` +
      `${crop.bled} of ${crop.total} frames bleed past it\n`,
  );
}

const aspect = crop ? crop.width / crop.height : first.width / first.height;

/** Source → cropped → resized, in that order, for every output. */
const pipeline = (file, width) => {
  const s = sharp(path.join(source, file));
  return (crop ? s.extract(crop) : s).resize({ width, withoutEnlargement: true });
};

fs.rmSync(OUT, { recursive: true, force: true });

const totals = {};

for (const [w, width] of WIDTHS.entries()) {
  const dir = path.join(OUT, `w${width}`);
  fs.mkdirSync(dir, { recursive: true });
  const quality = w === 0 ? QUALITY - QUALITY_STEP_DOWN : QUALITY;
  let bytes = 0;

  for (const [i, frame] of selected.entries()) {
    const target = path.join(dir, `${String(i).padStart(3, '0')}.webp`);
    await pipeline(frame.file, width)
      // `effort: 6` is slow to encode and 8–12% smaller than the default. This
      // runs once per render, and every visitor pays for the bytes.
      //
      // `alphaQuality: 100` is not negotiable: the alpha channel here is the
      // silhouette of a machined metal edge against the page, and lossy alpha
      // shows up as a dirty fringe exactly where the eye is looking.
      .webp({ quality, alphaQuality: 100, effort: 6 })
      .toFile(target);
    bytes += fs.statSync(target).size;
    if (i % 25 === 0) process.stdout.write(`  w${width}: ${i + 1}/${selected.length}\r`);
  }

  totals[width] = bytes;
  const mb = (bytes / 1024 / 1024).toFixed(2);
  const per = Math.round(bytes / selected.length / 1024);
  console.log(
    `  w${width}: ${selected.length} frames at q${quality}, ${mb} MB total, ~${per} KB each`,
  );
}

/**
 * The poster is the last frame: the finished product, enclosure closed. It is
 * what someone sees with JavaScript off, with reduced motion on, and in the
 * moment before the sequence has downloaded — so it has to be the frame that
 * says the most on its own, which is the end of the story, not the start.
 */
const poster = path.join(OUT, 'poster.webp');
await pipeline(selected.at(-1).file, WIDTHS.at(-1))
  .webp({ quality: 82, alphaQuality: 100, effort: 6 })
  .toFile(poster);

const manifest = {
  count: selected.length,
  widths: WIDTHS,
  aspect: Number(aspect.toFixed(4)),
  quality: QUALITY,
  sourceFrames: frames.length,
  crop: crop ?? null,
  zoom: { start: ZOOM_START, end: ZOOM_END },
  generated: new Date().toISOString().slice(0, 10),
};
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

const mobile = totals[WIDTHS[0]];
console.log(
  `\n  poster.webp: ${(fs.statSync(poster).size / 1024).toFixed(0)} KB` +
    `\n  manifest.json written\n`,
);

if (mobile > BUDGET_BYTES) {
  const perFrame = mobile / selected.length;
  console.error(
    `\nMobile set is ${(mobile / 1024 / 1024).toFixed(2)} MB, over the 2 MB hero budget in ` +
      `CLAUDE.md.\n\n` +
      `At ${Math.round(perFrame / 1024)} KB a frame the ceiling is ` +
      `${Math.floor(BUDGET_BYTES / perFrame)} frames — try:\n` +
      `  npm run hero -- "${source}" --frames ${Math.floor(BUDGET_BYTES / perFrame)}\n\n` +
      `Fewer frames costs less than lower quality here. Scroll scrubbing hides a ` +
      `dropped frame; it does not hide a smeared reflection on brushed metal.\n` +
      `public/hero/ has been left as written so you can look at it before deciding.`,
  );
  process.exit(1);
}

console.log(
  `Mobile set is ${(mobile / 1024 / 1024).toFixed(2)} MB of the 2 MB budget. ` +
    `Commit public/hero/.`,
);
