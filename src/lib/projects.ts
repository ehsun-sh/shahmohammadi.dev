import { getCollection, type CollectionEntry } from 'astro:content';
import { cv } from '../data/cv';

/**
 * Joins the two halves of a project.
 *
 * The résumé line — name, year, one-sentence summary, tags — lives in
 * `cv.json`, because `resume.typ` prints it and CLAUDE.md allows a fact one
 * home. The write-up lives in `src/content/projects/<slug>.md`. `slug` on the
 * cv.json entry is the join key and the URL.
 *
 * That means adding a project is: one entry in cv.json (it belongs on the
 * résumé anyway), one markdown file named after its slug. No route, no
 * component, no template. This module is the only place that knows the two
 * are related.
 */

export interface ProjectPage {
  slug: string;
  /** The résumé-side facts. Never restate these in frontmatter. */
  cv: (typeof cv.projects)[number];
  entry: CollectionEntry<'projects'>;
  /** Written but not published. Rendered in dev, absent from the build. */
  draft: boolean;
}

/**
 * Drafts are visible while `npm run dev` is running and gone from `npm run
 * build`, so an unfinished write-up can be reviewed in place without being
 * published. This is the only difference between the two environments.
 */
const showDrafts = import.meta.env.DEV;

let cache: ProjectPage[] | null = null;

/**
 * Every project that has a page, in cv.json's order — which is the résumé's
 * order, so the site and the PDF cannot drift apart on which project leads.
 */
export async function getProjectPages(): Promise<ProjectPage[]> {
  if (cache) return cache;

  const entries = await getCollection('projects');
  const byId = new Map(entries.map((entry) => [entry.id, entry]));

  // A write-up with no cv.json entry would build a page that nothing links to
  // and no sitemap consumer would rank. Almost always a slug typo on one side.
  const orphans = entries.filter(
    (entry) => !cv.projects.some((project) => project.slug === entry.id),
  );
  if (orphans.length > 0) {
    throw new Error(
      `src/content/projects/ has write-ups with no matching cv.json entry: ` +
        `${orphans.map((entry) => entry.id).join(', ')}. Add a project to ` +
        `cv.json with that exact "slug", or rename the file to match one.`,
    );
  }

  const pages: ProjectPage[] = [];

  for (const project of cv.projects) {
    if (!project.slug) continue;

    const entry = byId.get(project.slug);

    // Set slug, forget the file, and every link to this project 404s. The
    // dashed-frame treatment used for a missing thumbnail is not available
    // here — a link is either real or it is a broken promise.
    if (!entry) {
      throw new Error(
        `cv.json project "${project.name}" has slug "${project.slug}" but ` +
          `src/content/projects/${project.slug}.md does not exist. Create it ` +
          `(copy _template.md), or set "slug": null until the write-up is ` +
          `written — that renders the entry as plain text with no link.`,
      );
    }

    // Seeded write-ups carry TODO markers where a measurement or a part number
    // has to come from Ehsan. Drafts may keep them; a published page may not.
    // Every one of these pages is a claim a technical interviewer can probe,
    // and "TODO" in front of a recruiter is worse than no page at all.
    if (!entry.data.draft && /\bTODO\b/.test(entry.body ?? '')) {
      throw new Error(
        `src/content/projects/${project.slug}.md is published (draft: false) ` +
          `but still contains TODO markers. Fill them in, or set draft: true ` +
          `until it is ready.`,
      );
    }

    pages.push({
      slug: project.slug,
      cv: project,
      entry,
      draft: entry.data.draft,
    });
  }

  cache = pages.filter((page) => showDrafts || !page.draft);
  return cache;
}

/**
 * Whether the landing page should link a project entry to its own page.
 *
 * Derived rather than declared: a draft is by definition unpublished, so it
 * gets no link, and nothing has to be flipped in two places to keep that true.
 */
export async function getLinkedSlugs(): Promise<Set<string>> {
  const pages = await getProjectPages();
  return new Set(pages.map((page) => page.slug));
}

/** Human-readable status, used in the meta strip and the index. */
export const STATUS_LABEL: Record<
  CollectionEntry<'projects'>['data']['status'],
  string
> = {
  shipped: 'Shipped',
  prototype: 'Prototype',
  'in-progress': 'In progress',
  archived: 'Archived',
};
