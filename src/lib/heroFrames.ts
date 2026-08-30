import fs from 'node:fs';
import path from 'node:path';

/**
 * Build-time read of the hero sequence manifest.
 *
 * Deliberately tolerant: if `public/hero/` is not there, this returns null and
 * the hero falls back to the drawn SVG board. That is what lets the whole
 * scroll mechanism be written, reviewed and shipped before the renders exist —
 * and it is what keeps the site building on a machine that has the repo but not
 * the frames.
 *
 * Read from disk rather than imported, because a static `import` of a file that
 * may not exist fails the build, which is exactly the outcome being avoided.
 * The frames live in `public/` and not in `src/assets/` on purpose: there are a
 * hundred of them at two widths, `astro:assets` would hash every one, and the
 * client script needs to build their URLs from an index at runtime.
 */
export interface HeroManifest {
  /** Number of frames, 0..count-1. */
  count: number;
  /** Rendered widths, narrowest first. */
  widths: number[];
  /** width / height of the source render. */
  aspect: number;
  quality: number;
  sourceFrames: number;
  generated: string;
}

const MANIFEST = path.join(process.cwd(), 'public', 'hero', 'manifest.json');

let cache: HeroManifest | null | undefined;

export function getHeroManifest(): HeroManifest | null {
  if (cache !== undefined) return cache;

  if (!fs.existsSync(MANIFEST)) {
    cache = null;
    return cache;
  }

  const parsed = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) as HeroManifest;

  // A manifest that disagrees with what is on disk would show up as a hole in
  // the animation at one specific scroll position, which is close to impossible
  // to notice in review and trivial to catch here.
  const dir = path.dirname(MANIFEST);
  for (const width of parsed.widths) {
    const last = path.join(dir, `w${width}`, `${String(parsed.count - 1).padStart(3, '0')}.webp`);
    if (!fs.existsSync(last)) {
      throw new Error(
        `public/hero/manifest.json claims ${parsed.count} frames at w${width}, but ` +
          `${path.relative(process.cwd(), last)} is missing. Re-run \`npm run hero\`.`,
      );
    }
  }

  cache = parsed;
  return cache;
}

/** Root-relative URL for one frame. Mirrored by the client script. */
export function frameUrl(index: number, width: number): string {
  return `/hero/w${width}/${String(index).padStart(3, '0')}.webp`;
}
