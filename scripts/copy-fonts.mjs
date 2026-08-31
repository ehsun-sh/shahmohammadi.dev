/**
 * Copies the Noto Sans variable webfont out of node_modules into public/fonts/.
 *
 *   npm run fonts
 *
 * Same deal as `npm run icons`: the outputs are committed rather than built.
 * Two reasons, and only the second is about convenience.
 *
 * 1. A bundled font gets a content hash in its filename, and you cannot write
 *    `<link rel="preload">` for a URL you do not know until after the build.
 *    The typeface is the LCP dependency on every page — it has to be requested
 *    from the HTML, not discovered later when the CSS parses. A fixed path in
 *    public/ is what makes that possible.
 * 2. Fontsource ships nine unicode subsets per axis. Importing its stylesheet
 *    would copy all nine into dist/ even though a browser fetches only `latin`.
 *    This takes the two files the site can actually use and leaves the rest.
 *
 * Regenerate whenever @fontsource-variable/noto-sans is upgraded. The version
 * is pinned by package-lock, so the bytes are reproducible.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const FROM = path.join(
  ROOT,
  'node_modules',
  '@fontsource-variable',
  'noto-sans',
  'files',
);
const TO = path.join(ROOT, 'public', 'fonts');

// Latin only. The site is English; the CV, the write-ups and the résumé all
// are. Adding a subset means adding an audience, not adding coverage.
const FILES = [
  'noto-sans-latin-wght-normal.woff2',
  'noto-sans-latin-wght-italic.woff2',
];

fs.mkdirSync(TO, { recursive: true });

for (const file of FILES) {
  const source = path.join(FROM, file);
  if (!fs.existsSync(source)) {
    throw new Error(
      `${source} is missing. Run \`npm install\` first — the font comes from ` +
        `@fontsource-variable/noto-sans, it is not vendored in this repo.`,
    );
  }
  fs.copyFileSync(source, path.join(TO, file));
  const kb = (fs.statSync(source).size / 1024).toFixed(1);
  console.log(`public/fonts/${file}  ${kb} KB`);
}
