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
        /**
         * THE FIXED TABLE. Every project answers these, in this order, and the
         * page renders them itself — so the block reads the same on all of them
         * and a reader who has seen one knows where to look on the next.
         *
         * That is the whole reason they are named fields rather than more
         * label/value pairs: a free-form table is only as consistent as whoever
         * last edited it, and these six questions are the ones a recruiter or
         * an interviewer asks about every project regardless of what it is.
         *
         * Year and Status are NOT here. Year is in cv.json because the résumé
         * prints it, and status already had a field; the layout pulls both into
         * the same table. Nothing restates them.
         */

        /** What you personally owned. Be honest about scope on team projects —
         *  an inflated claim is the one thing a technical interview finds. */
        role: z.string(),

        /**
         * Who it was for: an employer, a named client, a university, or
         * yourself. Required, because "was this real work or a side project"
         * is the question the rest of the page is read in the light of, and a
         * page that leaves it unanswered gets the pessimistic assumption.
         *
         * Free text rather than an enum — "MSc thesis, Sharif University" and
         * "Client under NDA, telecom sector" are both true answers and neither
         * fits a fixed vocabulary. Say the organisation's name when you can.
         */
        context: z.string(),

        /**
         * Languages, tools and instruments. Required and deliberately separate
         * from cv.json's `tags`, which are domain keywords for scanning — "SDR",
         * "Optical", "Medical" — not things you drove. Altium, ESP-IDF,
         * NumPy, a VNA, a BERT: this row is what you would be asked to prove you
         * can use.
         */
        tools: z.string(),

        /**
         * Size and shape of the team, when there was one. Optional, and it
         * earns a row of its own because it is otherwise buried mid-sentence in
         * `role` — "led five engineers" and "sole author" are the first thing an
         * interviewer wants and the last thing they should have to hunt for.
         */
        team: z.string().optional(),

        /**
         * Optional, because most hardware work has no licence to state. Say so
         * when that is the answer — "Client-owned, unpublished" is a real and
         * useful value, and more honest than an absent row on a project whose
         * source a reader might otherwise go looking for.
         */
        licence: z.string().optional(),

        status: z.enum(['shipped', 'prototype', 'in-progress', 'archived']),

        cover: image().optional(),
        coverAlt: z.string().optional(),

        /**
         * The SECOND table, and it is optional. Free-form label/value pairs for
         * the engineering numbers, which cannot be fixed fields: a transceiver
         * is described by line rate, wavelength and reach, a relay by sampling
         * rate and trip classes, and one schema would fit neither.
         *
         * It is deliberately not the first table any more. Uniformity is worth
         * more at the top of the page — every project answers the same six
         * questions in the same order — and the per-project physics is worth
         * more below it, where nobody expects two projects to match. Leave it
         * empty and the section does not render.
         *
         * Numbers belong here; adjectives do not, and anything that needs a
         * sentence belongs in the write-up.
         */
        specs: z
          .array(z.object({ label: z.string(), value: z.string() }))
          .default([]),

        /** Rendered as the fixed table's last row, not as a section of their
         *  own: a link is one of the things every project is asked for, so it
         *  belongs where the rest of those answers are. */
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
