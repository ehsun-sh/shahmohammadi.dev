/**
 * Renders the banner at the top of the GitHub profile README.
 *
 *   npm run banner              -> ../ehsun-sh/assets
 *   npm run banner -- <dir>     -> somewhere else
 *
 * The output belongs to a *different* repository — github.com/ehsun-sh/ehsun-sh,
 * the profile README — which is why this writes outside the project and nothing
 * under `public/` is touched. It is a committed asset over there, the same
 * arrangement as the favicon set here: regenerated deliberately, never built.
 * Re-run it after any change to the name, the label, the mark or the palette,
 * and commit the two PNGs in that repo.
 *
 * It is the same machinery as src/lib/og.ts — satori lays the card out with the
 * *embedded* Noto Sans the site ships and resvg rasterizes it — so the banner is
 * the site's own drawing rather than a lookalike, and it is byte-stable across
 * machines because nothing is read from the system's installed fonts.
 *
 * `sharp` arrives through Astro's image service rather than package.json, the
 * same way scripts/build-hero-frames.mjs takes it.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

const ROOT = process.cwd();
const OUT = path.resolve(ROOT, process.argv[2] ?? path.join('..', 'ehsun-sh', 'assets'));

/**
 * Both grounds are the host's canvas, not the site's: this image sits inside a
 * GitHub README, and a banner carrying its own tint reads as a rectangle pasted
 * onto the page rather than the top of it. GitHub's dark canvas is #0D1117 and
 * its light one is white. Only the ink and the greys are the site's, and there
 * is deliberately no accent here — colour has four jobs and a rule under a name
 * is none of them.
 *
 * These hex values duplicate global.css on purpose, for the same reason
 * src/lib/og.ts does: a generated PNG cannot read CSS custom properties.
 */
const PALETTE = {
  light: { bg: '#FFFFFF', text: '#1D1D1F', muted: '#6E6E73', border: '#D2D2D7' },
  dark: { bg: '#0E1117', text: '#F5F5F7', muted: '#A1A1A6', border: '#3A3A3C' },
};

/** 2x a 1200-wide design: crisp on a retina panel, readable as CSS pixels here. */
const S = 2;
const WIDTH = 1200 * S;
const PAD = 60 * S; // canvas edge to ink, top and bottom
const PAD_X = 72 * S;
const GAP = 44 * S;

const cv = JSON.parse(await fs.readFile(path.join(ROOT, 'src/data/cv.json'), 'utf8'));
const NAME = cv.basics.name;
const LABEL = cv.basics.label;
const LINE = 'PCB & signal integrity · Embedded firmware · Optical systems';

/**
 * Satori reads neither woff2 nor a variable axis, so the card takes the static
 * family from @fontsource/noto-sans — same drawing as the pages load, different
 * container. The OG cards make the same swap.
 */
const fontFile = (weight) =>
  path.join(ROOT, 'node_modules/@fontsource/noto-sans/files', `noto-sans-latin-${weight}-normal.woff`);

const [regular, bold] = await Promise.all([fs.readFile(fontFile(400)), fs.readFile(fontFile(700))]);
const fonts = [
  { name: 'Noto Sans', data: regular, weight: 400, style: 'normal' },
  { name: 'Noto Sans', data: bold, weight: 700, style: 'normal' },
];

const logoSvg = (await fs.readFile(path.join(ROOT, 'src/assets/brand/logo.svg'), 'utf8')).replace(
  /<!--[\s\S]*?-->/g,
  '',
);

/** `currentColor` means nothing to an <img>, so it is resolved per theme. */
const logo = (color) =>
  `data:image/svg+xml;base64,${Buffer.from(logoSvg.replace('currentColor', color)).toString('base64')}`;

/** Satori takes a React-element-shaped tree; plain objects avoid JSX config for one file. */
const div = (style, children) => ({ type: 'div', props: { style, children } });

function banner(c, { height, padTop, logoBox, logoMarginTop, withLogo = true, withText = true }) {
  const children = [];

  if (withLogo) {
    children.push({
      type: 'img',
      props: {
        src: logo(c.text),
        width: logoBox,
        height: logoBox,
        style: { marginTop: logoMarginTop },
      },
    });
  }

  if (withText) {
    // Every element holding more than one child must declare `display: flex` —
    // Satori has no block layout.
    children.push(
      div({ display: 'flex', flexDirection: 'column', flexGrow: 1 }, [
        div(
          {
            fontSize: 52 * S,
            fontWeight: 700,
            letterSpacing: '-0.021em',
            color: c.text,
            lineHeight: 1.05,
          },
          NAME,
        ),
        div({ fontSize: 24 * S, color: c.muted, marginTop: 12 * S, lineHeight: 1.35 }, LABEL),
        div(
          {
            display: 'flex',
            marginTop: 22 * S,
            paddingTop: 16 * S,
            borderTop: `${S}px solid ${c.border}`,
            fontSize: 19 * S,
            color: c.muted,
          },
          LINE,
        ),
      ]),
    );
  }

  return div(
    {
      width: '100%',
      height: '100%',
      display: 'flex',
      // Not `center`: the mark is placed by a measured offset below, and a
      // centred row would fold that offset in half behind the arithmetic.
      alignItems: 'flex-start',
      gap: GAP,
      backgroundColor: c.bg,
      padding: `${padTop}px ${PAD_X}px`,
      fontFamily: 'Noto Sans',
    },
    children,
  );
}

async function render(c, opts) {
  const svg = await satori(banner(c, opts), { width: WIDTH, height: opts.height, fonts });
  return new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng();
}

/**
 * The first and last rows of a PNG carrying ink, optionally within an x band.
 * Anything more than a rounding distance from the corner pixel counts, which is
 * enough to ignore the antialiasing skirt without missing the muted greys.
 */
async function inkRows(png, x0 = 0, x1 = WIDTH) {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const bg = [data[0], data[1], data[2]];
  let top = -1;
  let bottom = -1;

  for (let y = 0; y < info.height; y++) {
    let hit = false;
    for (let x = Math.max(0, x0); x < Math.min(info.width, x1); x++) {
      const i = (y * info.width + x) * info.channels;
      const delta =
        Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]);
      if (delta > 24) {
        hit = true;
        break;
      }
    }
    if (hit) {
      if (top < 0) top = y;
      bottom = y;
    }
  }

  return { top, bottom, height: bottom - top + 1 };
}

/**
 * The mark's size is measured, not chosen: its ink runs from the cap of the
 * name to the baseline of the discipline line.
 *
 * This cannot be done by matching boxes. The text block's box overshoots its
 * ink at both ends — half-leading above the name, descender space under the
 * last line — and the mark's own ink fills only ~89.5% of its square, so the
 * two overshoots do not cancel and a box-for-box match leaves the mark visibly
 * hanging past the text. So both spans are read off probe renders, the size and
 * offset are solved from them, and the result is re-measured to prove it.
 */
const probe = { height: 1000, padTop: 200, logoBox: 400, logoMarginTop: 0 };
const measuringPalette = PALETTE.dark;

// 1. Where the text's ink sits relative to the top of its box.
const text = await inkRows(await render(measuringPalette, { ...probe, withLogo: false }));
const leading = text.top - probe.padTop;

// 2. How much of its box the mark's ink fills, and where inside it that starts.
const mark = await inkRows(await render(measuringPalette, { ...probe, withText: false }));
const ratioTop = (mark.top - probe.padTop) / probe.logoBox;
const ratioHeight = mark.height / probe.logoBox;

// 3. Solve, then set the canvas so the ink keeps equal air above and below.
const logoBox = Math.round(text.height / ratioHeight);
const final = {
  logoBox,
  logoMarginTop: Math.round(leading - ratioTop * logoBox),
  height: Math.round(text.height + 2 * PAD),
  padTop: Math.round(PAD - leading),
};

console.log(`text ink ${text.height}px, leading above ${leading}px`);
console.log(
  `mark fills ${(ratioHeight * 100).toFixed(1)}% of its box -> ${final.logoBox}px, offset ${final.logoMarginTop}px`,
);
console.log(`canvas ${WIDTH}x${final.height}`);

await fs.mkdir(OUT, { recursive: true });

for (const [theme, colors] of Object.entries(PALETTE)) {
  const png = await render(colors, final);
  const file = path.join(OUT, `banner-${theme}.png`);
  await fs.writeFile(file, png);

  // Verify against the render, not against the arithmetic above.
  const drawnMark = await inkRows(png, 0, PAD_X + final.logoBox);
  const drawnText = await inkRows(png, PAD_X + final.logoBox + GAP / 2, WIDTH);
  const skew = Math.max(
    Math.abs(drawnMark.top - drawnText.top),
    Math.abs(drawnMark.bottom - drawnText.bottom),
  );
  if (skew > 2) {
    throw new Error(
      `${theme}: the mark's ink (${drawnMark.top}-${drawnMark.bottom}) is ${skew}px out of step ` +
        `with the text's (${drawnText.top}-${drawnText.bottom}). Re-solve rather than nudge.`,
    );
  }

  console.log(`${theme}  ${path.relative(ROOT, file)}  ${(png.length / 1024).toFixed(1)} KB  skew ${skew}px`);
}
