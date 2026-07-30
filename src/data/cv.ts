import { z } from 'astro/zod';
import raw from './cv.json';

/**
 * Schema for cv.json. Parsed at build time so a typo in the data file fails
 * `npm run build` instead of silently rendering an empty section — and so the
 * rest of the codebase gets real types off a plain JSON file.
 *
 * The Typst resume template reads the same cv.json directly. If you add a
 * field here, add it there too.
 */

const dateish = z.string().min(4); // "2023" | "2023-01" | "2023-01-15"

const profile = z.object({
  network: z.string(),
  username: z.string(),
  url: z.string().url(),
});

const workEntry = z.object({
  company: z.string(),
  position: z.string(),
  location: z.string().default(''),
  startDate: dateish,
  endDate: dateish.nullable(), // null = current role
  summary: z.string().default(''),
  highlights: z.array(z.string()).default([]),
  stack: z.array(z.string()).default([]),
});

const educationEntry = z.object({
  institution: z.string(),
  area: z.string(),
  studyType: z.string(),
  startDate: dateish,
  endDate: dateish,
  note: z.string().default(''),
});

const skillGroup = z.object({
  category: z.string(),
  items: z.array(z.string()).min(1),
});

const offering = z.object({
  title: z.string(),
  description: z.string(),
  deliverables: z.array(z.string()).default([]),
});

/** Résumé-length project entries. Full write-ups live in the `projects`
 *  content collection; `slug` links the two when a write-up exists. */
const projectEntry = z.object({
  name: z.string(),
  year: dateish,
  summary: z.string(),
  tags: z.array(z.string()).default([]),
  slug: z.string().nullable().default(null),
});

const award = z.object({
  title: z.string(),
  issuer: z.string(),
  date: dateish,
  url: z.string().url().optional(),
});

export const cvSchema = z.object({
  basics: z.object({
    name: z.string(),
    label: z.string(),
    headline: z.string(),
    summary: z.string(),
    email: z.string(),
    /** No `phone` field by design. `/resume.pdf` is a public URL and this repo
     *  is readable, so "PDF only" would not have protected it. Keep the number
     *  in a separate private résumé for direct applications. */
    url: z.string().url(),
    location: z.object({
      city: z.string(),
      countryCode: z.string(),
      remote: z.boolean().default(true),
    }),
    availability: z.object({
      open: z.boolean(),
      note: z.string().default(''),
    }),
    profiles: z.array(profile).default([]),
  }),
  work: z.array(workEntry).default([]),
  education: z.array(educationEntry).default([]),
  skills: z.array(skillGroup).default([]),
  projects: z.array(projectEntry).default([]),
  awards: z.array(award).default([]),
  languages: z
    .array(z.object({ language: z.string(), fluency: z.string() }))
    .default([]),
  certificates: z
    .array(
      z.object({
        name: z.string(),
        issuer: z.string(),
        date: dateish,
        url: z.string().url().optional(),
      }),
    )
    .default([]),
  services: z.object({
    intro: z.string(),
    offerings: z.array(offering).default([]),
    engagement: z
      .array(z.object({ model: z.string(), fit: z.string() }))
      .default([]),
    beforeWeStart: z.array(z.string()).default([]),
  }),
});

export type CV = z.infer<typeof cvSchema>;

const parsed = cvSchema.safeParse(raw);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
    .join('\n');
  throw new Error(`src/data/cv.json failed validation:\n${details}`);
}

export const cv: CV = parsed.data;

/** True while any TODO placeholder remains, so the UI can warn during dev. */
export const cvHasPlaceholders = JSON.stringify(parsed.data).includes('TODO');

/** "Jan 2023 — Present" */
export function formatRange(start: string, end: string | null): string {
  return `${formatMonth(start)} — ${end ? formatMonth(end) : 'Present'}`;
}

function formatMonth(value: string): string {
  const [year, month] = value.split('-');
  if (!month) return year ?? value;
  const date = new Date(Number(year), Number(month) - 1, 1);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
