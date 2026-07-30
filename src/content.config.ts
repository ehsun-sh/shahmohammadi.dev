import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Engineering project write-ups.
 *
 * The hardware block is what makes these pages worth reading for a technical
 * audience — keep it filled in. Per CLAUDE.md, none of this may include
 * employer schematics, Gerbers or layouts; block diagrams and reasoning only.
 */
const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string().max(200),
      date: z.coerce.date(),
      status: z.enum(['shipped', 'prototype', 'in-progress', 'archived']),
      role: z.string(),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      featured: z.boolean().default(false),
      order: z.number().default(0),
      draft: z.boolean().default(false),

      // Hardware specifics surfaced as a spec table on the project page.
      hardware: z
        .object({
          mcu: z.string().optional(),
          layers: z.number().int().min(1).max(32).optional(),
          stackup: z.string().optional(),
          dimensions: z.string().optional(),
          powerBudget: z.string().optional(),
          interfaces: z.array(z.string()).default([]),
          certifications: z.array(z.string()).default([]),
        })
        .optional(),

      tags: z.array(z.string()).default([]),
      links: z
        .array(z.object({ label: z.string(), href: z.string().url() }))
        .default([]),
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
