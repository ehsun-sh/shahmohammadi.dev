import fs from 'node:fs/promises';
import path from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

/**
 * Social card renderer.
 *
 * Runs at build time only. Satori lays the card out with an *embedded* font
 * rather than a system one, and resvg rasterizes it, so the PNG is byte-stable
 * whether the build runs on Windows or on the Ubuntu runner in CI — the usual
 * failure mode for OG images is text reflowing because the runner had different
 * fonts installed.
 *
 * These hex values duplicate the light palette in `global.css` on purpose: a
 * generated PNG cannot read CSS custom properties. Keep the two in sync.
 */
const COLOR = {
  bg: '#F4F5F9',
  text: '#1D1D1F',
  muted: '#6E6E73',
  accent: '#0071E3',
  border: '#D2D2D7',
} as const;

const WIDTH = 1200;
const HEIGHT = 630;

/**
 * Paths are anchored to the project root, not to `import.meta.url`. This module
 * gets bundled into `dist/.prerender/chunks/` before it runs, so anything
 * relative to the module's own URL resolves inside `dist` and fails. `cwd` is
 * the project root for `astro build` both locally and on the CI runner.
 */
const fromRoot = (...segments: string[]) =>
  path.join(process.cwd(), ...segments);

/**
 * The site's typeface, in its static form. Satori cannot read woff2 or a
 * variable axis, so the card uses the same family from `@fontsource/noto-sans`
 * rather than the variable file the pages load — same drawing, different
 * container.
 */
const font = (weight: 400 | 600 | 700) =>
  fromRoot(
    'node_modules',
    '@fontsource',
    'noto-sans',
    'files',
    `noto-sans-latin-${weight}-normal.woff`,
  );

const LOGO = fromRoot('src', 'assets', 'brand', 'logo.svg');

let cached: { fonts: Awaited<ReturnType<typeof loadFonts>>; logo: string } | null =
  null;

async function loadFonts() {
  const [regular, bold] = await Promise.all([
    fs.readFile(font(400)),
    fs.readFile(font(700)),
  ]);
  return [
    { name: 'Noto Sans', data: regular, weight: 400 as const, style: 'normal' as const },
    { name: 'Noto Sans', data: bold, weight: 700 as const, style: 'normal' as const },
  ];
}

async function assets() {
  if (!cached) {
    const [fonts, logoSvg] = await Promise.all([
      loadFonts(),
      fs.readFile(LOGO, 'utf8'),
    ]);
    // The mark ships as `currentColor`, which means nothing to an <img>: Satori
    // would draw it black. The card is a fixed light surface, so the colour is
    // resolved here to the same ink the title uses.
    const resolved = logoSvg
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace('currentColor', COLOR.text);
    cached = {
      fonts,
      logo: `data:image/svg+xml;base64,${Buffer.from(resolved).toString('base64')}`,
    };
  }
  return cached;
}

export interface OgOptions {
  /** Large line. Usually the person's name or the page title. */
  title: string;
  /** Supporting line under the title. */
  subtitle: string;
  /** Small line beside the logo. Defaults to the domain. */
  kicker?: string;
}

export async function renderOgImage({
  title,
  subtitle,
  kicker = 'shahmohammadi.dev',
}: OgOptions): Promise<Buffer> {
  const { fonts, logo } = await assets();

  // Satori takes a React-element-shaped tree; plain objects avoid needing JSX
  // config for one file. Note that every element holding more than one child
  // must declare `display: flex` — Satori has no block layout.
  const tree = {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: COLOR.bg,
        padding: '72px',
        fontFamily: 'Noto Sans',
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', gap: '20px' },
            children: [
              {
                // No border radius any more — the hexagon silhouette is the
                // shape, so there is no plate left to round off.
                type: 'img',
                props: { src: logo, width: 64, height: 64 },
              },
              {
                type: 'div',
                props: {
                  style: { fontSize: 26, color: COLOR.muted },
                  children: kicker,
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column' },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    width: '64px',
                    height: '5px',
                    borderRadius: '999px',
                    backgroundColor: COLOR.accent,
                    marginBottom: '34px',
                  },
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 68,
                    fontWeight: 700,
                    letterSpacing: '-0.021em',
                    color: COLOR.text,
                    lineHeight: 1.05,
                  },
                  children: title,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    // 31, down from 34, because the site's face sets about 9%
                    // wider than Inter did at the same size. The two changes
                    // cancel, which is what keeps the character clamp in
                    // og/projects/[slug].png.ts valid across the swap.
                    //
                    // Unchanged by the move from Open Sans to Noto Sans: their
                    // advance widths were compared glyph by glyph over the real
                    // subtitles and Noto sets 1.01x wider, which is inside the
                    // rounding on both numbers.
                    fontSize: 31,
                    color: COLOR.muted,
                    marginTop: '20px',
                    lineHeight: 1.35,
                  },
                  children: subtitle,
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              borderTop: `1px solid ${COLOR.border}`,
              paddingTop: '26px',
              fontSize: 24,
              color: COLOR.muted,
            },
            children: 'PCB & signal integrity · Embedded firmware · Optical systems',
          },
        },
      ],
    },
  };

  const svg = await satori(tree as Parameters<typeof satori>[0], {
    width: WIDTH,
    height: HEIGHT,
    fonts,
  });

  return Buffer.from(
    new Resvg(svg, {
      fitTo: { mode: 'width', value: WIDTH },
      // Nothing may fall back to a system font; everything is embedded above.
      font: { loadSystemFonts: false },
    })
      .render()
      .asPng(),
  );
}
