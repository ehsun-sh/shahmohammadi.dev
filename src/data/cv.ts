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
  /**
   * One short line under the name, everywhere the project is titled. Not a
   * second summary — this is the phrase that finishes the name for someone who
   * has never heard of it, which is why "Maiman Studio" needs one and "Digital
   * Motor Protection Relay" does not.
   *
   * Optional for exactly that reason. A tagline on a name that already
   * describes itself is the same words twice, and forcing every project to have
   * one is how that happens. Lower case, no full stop: it reads as a
   * continuation of the name, not as a sentence after it.
   *
   * The résumé deliberately does not print it. There the summary sits directly
   * under the name and would say the same thing a line later.
   */
  tagline: z.string().default(''),
  year: dateish,
  summary: z.string(),
  tags: z.array(z.string()).default([]),
  slug: z.string().nullable().default(null),
  /** Filename inside src/assets/projects/, not a path and not a URL. The file
   *  has to exist there so `astro:assets` can hash and resize it at build
   *  time; anything else is a broken image nobody notices. Null renders the
   *  placeholder frame. See that folder's README for the export spec. */
  image: z.string().nullable().default(null),
  /** What the picture shows, for someone who cannot see it. Leave empty only
   *  if the image is pure decoration, which for a project shot it is not. */
  imageAlt: z.string().default(''),
  /**
   * Where the picture came from, when that changes how it should be read.
   *
   * Empty for a photograph or a screenshot of the real thing, because that is
   * what a reader already assumes and repeating it is noise. Set it whenever
   * the assumption would be WRONG: a concept mockup, an illustration, a CAD
   * render standing in for hardware nobody can photograph any more. Several of
   * these projects shipped a decade ago in someone else's factory, so a
   * mockup is often the only picture there is — which is fine, and is exactly
   * why it has to say so. An unlabelled mockup is a claim, and it is the kind
   * of claim an interview finds.
   *
   * Rendered next to the caption, not inside it: a caption argues about what
   * the picture shows, and this is a fact about the picture itself.
   */
  imageCredit: z.string().default(''),
  /**
   * Whether this project appears on the landing page and in `resume.pdf`.
   *
   * `/projects` ignores it and lists everything, which is the point: cv.json is
   * meant to hold every project, and the two places with a fixed budget take a
   * subset of it. The landing page is a CV where Projects is one section among
   * Experience, Skills and Education, and the résumé is one page.
   *
   * **Defaults to false, deliberately.** Adding a project should be a decision
   * about `/projects` only; growing the landing page and the PDF is a second,
   * separate decision, and a default of true would make it happen silently
   * every time. Two consumers, one flag — never a `featuredOnResume` as well.
   */
  featured: z.boolean().default(false),
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

/**
 * "Toronto, Ontario, Canada".
 *
 * `cv.json` stores an ISO code because schema.org's `addressCountry` wants one,
 * and that is the only place the raw code belongs. Anywhere a human reads it,
 * use this. src/resume/resume.typ carries its own copy of the map because Typst
 * cannot import TypeScript — keep the two in step.
 */
const COUNTRY_NAMES: Record<string, string> = {
  CA: 'Canada',
  IR: 'Iran',
  US: 'United States',
};

export const locationLabel = [
  cv.basics.location.city,
  COUNTRY_NAMES[cv.basics.location.countryCode] ?? cv.basics.location.countryCode,
].join(', ');

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
