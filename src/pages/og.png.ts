import type { APIRoute } from 'astro';
import { renderOgImage } from '../lib/og';
import { cv } from '../data/cv';

/** Prerendered to `dist/og.png` by the static build. */
export const GET: APIRoute = async () => {
  const png = await renderOgImage({
    title: cv.basics.name,
    subtitle: cv.basics.label,
  });

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
