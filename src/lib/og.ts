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
  bg: '#FBFBFD',
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

const font = (weight: 400 | 600 | 700) =>
  fromRoot(
    'node_modules',
    '@fontsource',
    'inter',
    'files',
    `inter-latin-${weight}-normal.woff`,
  );

const LOGO = fromRoot('src', 'assets', 'brand', 'logo.jpg');

let cached: { fonts: Awaited<ReturnType<typeof loadFonts>>; logo: string } | null =
  null;

async function loadFonts() {
  const [regular, semibold] = await Promise.all([
    fs.readFile(font(400)),
    fs.readFile(font(600)),
  ]);
  return [
    { name: 'Inter', data: regular, weight: 400 as const, style: 'normal' as const },
    { name: 'Inter', data: semibold, weight: 600 as const, style: 'normal' as const },
  ];
}

async function assets() {
  if (!cached) {
    const [fonts, logoBuffer] = await Promise.all([loadFonts(), fs.readFile(LOGO)]);
    cached = {
      fonts,
      logo: `data:image/jpeg;base64,${logoBuffer.toString('base64')}`,
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
        fontFamily: 'Inter',
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', gap: '20px' },
            children: [
              {
                type: 'img',
                props: {
                  src: logo,
                  width: 64,
                  height: 64,
                  style: { borderRadius: '16px' },
                },
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
                    fontSize: 76,
                    fontWeight: 600,
                    letterSpacing: '-0.03em',
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
                    fontSize: 34,
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
