import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Engineering project write-ups.
 *
 * One file per project, one template for all of them: `src/pages/projects/
 * [slug].astro` builds a page from every non-draft file here, so a future
 * project is a markdown file and nothing else. No page is ever hand-designed.
 *
 * **Name, year, summary and tags are deliberately absent.** They live in
 * `cv.json`, because the résumé prints them and CLAUDE.md allows a fact to
 * exist in exactly one place. The filename is the join: `mri-optical-coil.md`
 * pairs with the cv.json entry whose `slug` is `mri-optical-coil`, and
 * `src/lib/projects.ts` fails the build if either side is missing its partner.
 * Ordering comes from the cv.json array too, so the site and the PDF can never
 * disagree about which project comes first.
 *
 * What stays here is everything the résumé has no room for: what you owned,
 * the spec table, the long-form reasoning. Per CLAUDE.md, none of it may
 * include employer schematics, Gerbers or layouts — block diagrams, outcomes
 * and reasoning only.
 */
const projects = defineCollection({
  // `[^_]*` keeps `_template.md` out of the collection. The glob loader does
  // not skip underscore-prefixed files on its own — verified by watching the
  // build fail with `_template` reported as a write-up with no cv.json entry.
  loader: glob({ base: './src/content/projects', pattern: '**/[^_]*.{md,mdx}' }),
  schema: ({ image }) =>
    z
      .object({
        /** What you personally owned. Be honest about scope on team projects —
         *  an inflated claim is the one thing a technical interview finds. */
        role: z.string(),
        status: z.enum(['shipped', 'prototype', 'in-progress', 'archived']),

        cover: image().optional(),
        coverAlt: z.string().optional(),

        /**
         * The spec table. Free-form label/value pairs rather than fixed keys,
         * because the projects here are not all the same kind of object: a
         * transceiver is described by data rate, wavelength and reach, a relay
         * by sampling rate and trip classes, and an `mcu`/`layers` schema would
         * force both into a shape that fits neither.
         *
         * Keep labels consistent across projects anyway — see _template.md for
         * the set already in use. Numbers belong here; adjectives do not.
         */
        specs: z
          .array(z.object({ label: z.string(), value: z.string() }))
          .default([]),

        links: z
          .array(z.object({ label: z.string(), href: z.string().url() }))
          .default([]),

        /** Draft pages render in `npm run dev` and are excluded from the build,
         *  so an unfinished write-up can be reviewed without shipping it. */
        draft: z.boolean().default(false),
      })
      // A cover image without alt text is an accessibility bug; fail the build.
      .refine((d) => !d.cover || (d.coverAlt && d.coverAlt.length > 0), {
        message: 'coverAlt is required when cover is set',
        path: ['coverAlt'],
      }),
});

/** Technical writing. Highest-credibility-per-hour content on the site. */
const notes = defineCollection({
  loader: glob({ base: './src/content/notes', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(200),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, notes };
