import type { APIRoute, GetStaticPaths } from 'astro';
import { renderOgImage } from '../../../lib/og';
import { getProjectPages } from '../../../lib/projects';

/**
 * A social card per project.
 *
 * A project URL is the one thing on this site that gets pasted into a message
 * to a specific person — "this is the kind of thing I do". It should not
 * unfurl as the generic profile card that every other page shares.
 *
 * Built from the same cv.json summary the page prints, so the card cannot say
 * something the page does not.
 */

/**
 * Satori overflows rather than shrinking, and the card has room for about two
 * lines at the subtitle size.
 *
 * A whole first sentence beats a truncation whenever one fits: cutting the MRI
 * summary at 120 characters lands on "…over fibre. Designed…", which reads as
 * broken rather than as brief. Falls back to a word boundary when the first
 * sentence is itself too long, or when there is no sentence break to find.
 *
 * Both limits are set by where the text wraps, measured on the rendered card:
 * a line holds about 68 characters at the subtitle size, and a third line runs
 * into the rule above the footer.
 *
 * It was 118 when the card was set in Inter at 34px. The Droid Sans-descended
 * face the site moved to fits more per line at 31px, not fewer — the two
 * changes did not cancel as neatly here as they did for the layout — so the
 * limit went up with it. Re-measure this if the card's typeface or subtitle
 * size moves again; it is the one number in the OG pipeline that is calibrated
 * to the rendering rather than chosen.
 *
 * The Open Sans -> Noto Sans move did not move it. Their advance widths were
 * compared glyph by glyph over these very summaries: Noto sets 1.01x wider,
 * which puts the recalculated limit at 127 and is not worth spending a
 * character on.
 */
const TWO_LINES = 128;

function clamp(text: string, limit = TWO_LINES): string {
  if (text.length <= limit) return text;

  const sentence = text.match(/^.+?[.!?](?=\s|$)/)?.[0];
  if (sentence && sentence.length >= 40 && sentence.length <= 134) {
    return sentence;
  }

  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : limit).replace(/[.,;:]$/, '')}…`;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const pages = await getProjectPages();

  return pages.map((page) => ({
    params: { slug: page.slug },
    props: {
      title: page.cv.name,
      subtitle: clamp(page.cv.summary),
    },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgImage({
    title: props.title as string,
    subtitle: props.subtitle as string,
    kicker: 'Project · shahmohammadi.dev',
  });

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
