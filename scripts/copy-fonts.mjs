/**
 * Copies the site's webfonts out of node_modules into public/fonts/.
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
 * Regenerate whenever one of the packages below is upgraded. The versions are
 * pinned by package-lock, so the bytes are reproducible.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TO = path.join(ROOT, 'public', 'fonts');

// Latin only, every one of them. The site is English; the CV, the write-ups and
// the résumé all are. Adding a subset means adding an audience, not adding
// coverage.
//
// Two families and they are not peers. Noto Sans sets the entire site and is
// the LCP dependency on every page. Grand Hotel sets exactly one line — the
// hero's thesis, under the name — and is a static 400 because that is the only
// weight the family has; it is not in `--font-sans` and must never be asked to
// do a second job.
const FILES = [
  ['@fontsource-variable/noto-sans', 'noto-sans-latin-wght-normal.woff2'],
  ['@fontsource-variable/noto-sans', 'noto-sans-latin-wght-italic.woff2'],
  ['@fontsource/grand-hotel', 'grand-hotel-latin-400-normal.woff2'],
];

fs.mkdirSync(TO, { recursive: true });

for (const [pkg, file] of FILES) {
  const source = path.join(ROOT, 'node_modules', ...pkg.split('/'), 'files', file);
  if (!fs.existsSync(source)) {
    throw new Error(
      `${source} is missing. Run \`npm install\` first — the font comes from ` +
        `${pkg}, it is not vendored in this repo.`,
    );
  }
  fs.copyFileSync(source, path.join(TO, file));
  const kb = (fs.statSync(source).size / 1024).toFixed(1);
  console.log(`public/fonts/${file}  ${kb} KB`);
}
