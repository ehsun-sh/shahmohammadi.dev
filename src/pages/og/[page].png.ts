import type { APIRoute, GetStaticPaths } from 'astro';
import { renderOgImage } from '../../lib/og';
import { cv } from '../../data/cv';

/**
 * Per-page social cards. `/services` in particular gets shared straight to a
 * prospect, so it should not open with a card that says "Embedded, Hardware &
 * Optical Engineer" and nothing about the work on offer.
 */
const CARDS = {
  services: {
    title: 'Services',
    subtitle:
      'Schematic and PCB design, embedded firmware, optical link design, and EMC pre-compliance.',
  },
  contact: {
    title: 'Contact',
    subtitle: `Tell me what you are building and where it is stuck. — ${cv.basics.name}`,
  },
} as const;

export const getStaticPaths: GetStaticPaths = () =>
  Object.keys(CARDS).map((page) => ({ params: { page } }));

export const GET: APIRoute = async ({ params }) => {
  const card = CARDS[params.page as keyof typeof CARDS];

  if (!card) return new Response('Not found', { status: 404 });

  const png = await renderOgImage(card);

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
