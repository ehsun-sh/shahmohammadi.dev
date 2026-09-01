/**
 * Collects everything portfolio.typ needs into one JSON file.
 *
 *   node scripts/build-portfolio-data.mjs      (run by `npm run portfolio`)
 *
 * WHY THIS EXISTS
 * Typst reads JSON and cannot read YAML, so the project write-ups' frontmatter
 * has to be handed over in a form it can load. This script is the bridge and
 * nothing else: it does not decide anything the site does not already decide,
 * it joins the two halves of a project exactly the way src/lib/projects.ts does
 * for the website — cv.json for name, year, summary and tags, the markdown
 * frontmatter for role, context, tools and the rest — so the PDF cannot say
 * something the site does not.
 *
 * The markdown BODY is deliberately not included. A full write-up is several
 * pages of prose and the portfolio gives each project exactly one page; the
 * body is what /projects/<slug> is for, and the page carries its URL.
 *
 * Output is `private/portfolio.json`, which is gitignored along with the PDF
 * built from it. See the header of portfolio.typ for why that document is not
 * published.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

const ROOT = process.cwd();
const CV = path.join(ROOT, 'src', 'data', 'cv.json');
const WRITEUPS = path.join(ROOT, 'src', 'content', 'projects');
const ASSETS = path.join(ROOT, 'src', 'assets', 'projects');
const OUT_DIR = path.join(ROOT, 'private');
const OUT = path.join(OUT_DIR, 'portfolio.json');

/** Frontmatter only — the body is not part of this document. */
function frontmatter(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error(`${file} has no frontmatter block.`);
  return parseYaml(match[1]);
}

const cv = JSON.parse(fs.readFileSync(CV, 'utf8'));

/**
 * The same labels `STATUS_LABEL` in src/lib/projects.ts gives the website.
 * Duplicated rather than imported because that module is TypeScript inside the
 * Astro graph and this is a plain node script — but it is four words, and the
 * alternative was the PDF printing the raw enum `in-progress` where the site
 * says "In progress". If a status is ever added, add it in both places.
 */
const STATUS_LABEL = {
  shipped: 'Shipped',
  prototype: 'Prototype',
  'in-progress': 'In progress',
  archived: 'Archived',
};

const projects = cv.projects.map((project) => {
  // A project with no slug has no write-up by design — cv.json's own rule is
  // that `slug: null` means "listed, not yet written up". It still gets a page
  // here, built from the résumé facts alone, because this document is for
  // Ehsan and a project he has not written up yet is exactly the one he needs
  // reminding of.
  const file = project.slug
    ? path.join(WRITEUPS, `${project.slug}.md`)
    : null;
  const data = file && fs.existsSync(file) ? frontmatter(file) : {};

  // Typst cannot test for an absent dictionary key as cheaply as it can test
  // for an empty string, and every field below is optional in at least one
  // project. Normalising here keeps the template free of `.at(…, default: …)`
  // on every single line.
  const str = (v) => (typeof v === 'string' ? v.trim() : '');

  // The picture the project page shows, resolved the same way ProjectLayout
  // resolves it: the frontmatter `cover` if there is one, and cv.json's
  // thumbnail otherwise. Getting that order wrong is not fatal but it is
  // wrong — it put the logo card in the PDF while the website showed the
  // editor, which is the drift these two documents exist to avoid.
  //
  // `cover` is written relative to the markdown file, because that is what
  // Astro's `image()` wants; Typst resolves a leading `/` against `--root` and
  // rejects an OS-absolute path outright ("path contains invalid component
  // `D:`"), so it is re-rooted here. Empty when there is no picture at all, so
  // the template can skip the block rather than test for a missing file.
  const resolveAsset = (p) => {
    const abs = path.resolve(WRITEUPS, p);
    return fs.existsSync(abs)
      ? '/' + path.relative(ROOT, abs).split(path.sep).join('/')
      : '';
  };

  const image = data.cover
    ? resolveAsset(data.cover)
    : project.image && fs.existsSync(path.join(ASSETS, project.image))
      ? `/src/assets/projects/${project.image}`
      : '';

  return {
    name: project.name,
    tagline: str(project.tagline),
    year: project.year,
    summary: project.summary,
    tags: project.tags ?? [],
    slug: project.slug ?? '',
    url: project.slug ? `${cv.basics.url}/projects/${project.slug}` : '',
    featured: project.featured === true,
    image,
    role: str(data.role),
    team: str(data.team),
    context: str(data.context),
    tools: str(data.tools),
    licence: str(data.licence),
    status: STATUS_LABEL[str(data.status)] ?? str(data.status),
    draft: data.draft === true,
    specs: Array.isArray(data.specs) ? data.specs : [],
    links: Array.isArray(data.links) ? data.links : [],
  };
});

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ projects }, null, 2) + '\n');

const withCover = projects.filter((p) => p.image).length;
const drafts = projects.filter((p) => p.draft).length;
console.log(
  `private/portfolio.json — ${projects.length} projects ` +
    `(${withCover} with a cover, ${drafts} still draft)`,
);
