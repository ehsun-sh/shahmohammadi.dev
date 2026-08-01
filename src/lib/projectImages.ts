import type { ImageMetadata } from 'astro';

/**
 * Resolves a bare filename from `cv.json` to a real imported asset.
 *
 * `cv.json` can only carry a string, and `<Image />` needs the imported module
 * so Astro can hash, resize and re-encode the file. `import.meta.glob` with
 * `eager: true` bridges the two — a plain `import(variable)` cannot, because
 * the bundler has to see the candidate set statically.
 *
 * One glob, one place. The thumbnail beside a project entry and the cover on
 * its page are the same file resolved the same way, so a rename can only ever
 * break both at once, loudly, rather than one of them quietly.
 */
const modules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/projects/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

const available = () =>
  Object.keys(modules)
    .map((key) => key.split('/').pop())
    .join(', ') || '(none yet)';

/**
 * Throws rather than returning undefined when the name matches nothing. A
 * silent blank frame is the failure that survives review; a failed build is
 * not. `null` is the way to say "no image yet" — that renders the placeholder.
 */
export function resolveProjectImage(
  filename: string | null,
  /** Project name, so the error says which cv.json entry is wrong. */
  context: string,
): ImageMetadata | undefined {
  if (!filename) return undefined;

  const resolved = modules[`../assets/projects/${filename}`]?.default;

  if (!resolved) {
    throw new Error(
      `cv.json points project "${context}" at src/assets/projects/${filename}, ` +
        `which does not exist. Available: ${available()}`,
    );
  }

  return resolved;
}
