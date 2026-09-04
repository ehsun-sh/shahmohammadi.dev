import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

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
         * Further pictures, for the projects that need them — a board top and
         * bottom, a scope capture, a thermal image, an enclosure. Optional and
         * empty by default: most projects are carried by one cover, and a
         * gallery of one picture is a cover with extra steps.
         *
         * `image()` rather than a string, so every entry is resolved and
         * optimised at build time and a typo fails the build instead of
         * shipping a hole. `alt` is required for the same reason `coverAlt` is
         * refined below — a picture nobody can see is not evidence. `caption`
         * is optional and is what most of these want anyway: on an engineering
         * page the picture is usually the claim and the caption is the number.
         *
         * IP boundary (CLAUDE.md) applies here more than anywhere else on the
         * site. Photographs are the easiest way to publish a layout by
         * accident: no Gerbers, no schematics, no legible silkscreen on a
         * client's board.
         */
        gallery: z
          .array(
            z.object({
              src: image(),
              alt: z.string().min(1),
              caption: z.string().optional(),
              /** Provenance, when a reader would otherwise assume wrong — a
               *  concept mockup, an illustration, a CAD render. Absent for a
               *  photograph or a screenshot of the real thing. See the long
               *  note on `imageCredit` in src/data/cv.ts. */
              credit: z.string().optional(),
            }),
          )
          .default([]),

        /**
         * Drawings, as opposed to pictures — a block diagram, a signal chain,
         * a state machine. Same shape as `gallery` and deliberately a separate
         * field, because the two want opposite treatments and one array cannot
         * give them both.
         *
         * A photograph is looked at: it belongs in the carousel at the top,
         * where a fixed 16:10 frame keeps the page from resizing as the reader
         * pages through, and where its job is to say what the thing is before a
         * word is read. A drawing is READ: it is wide, it is full of small
         * labels, and letterboxing a 2.6:1 diagram into a 16:10 frame shrinks
         * the one thing that makes it worth showing. So diagrams render after
         * the write-up, one column, at the full measure and at their own
         * aspect ratio — which is also where they are useful, because a diagram
         * only means anything once the argument it illustrates has been made.
         *
         * The split is by what the picture IS, not by where you want it. Never
         * move a photograph here to get it out of the carousel.
         */
        diagrams: z
          .array(
            z.object({
              src: image(),
              alt: z.string().min(1),
              caption: z.string().optional(),
              /** Provenance, when a reader would otherwise assume wrong — a
               *  concept mockup, an illustration, a CAD render. Absent for a
               *  photograph or a screenshot of the real thing. See the long
               *  note on `imageCredit` in src/data/cv.ts. */
              credit: z.string().optional(),
            }),
          )
          .default([]),

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
          .array(z.object({ label: z.string(), href: z.url() }))
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
