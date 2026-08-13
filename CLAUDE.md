# CLAUDE.md

Personal portfolio / live CV / services site for Ehsan Shahmohammadi, deployed
to **shahmohammadi.dev** via GitHub Pages.

**Plan and phase order live in [`Docs/ROADMAP.md`](Docs/ROADMAP.md). Read it
before starting work.** `Docs/Portfolio_Architecture_Blueprint.pdf` is the
original proposal and is partly superseded — the roadmap wins on conflicts.
Repo, DNS and Pages setup is in [`Docs/DEPLOY.md`](Docs/DEPLOY.md).

## Stack

Astro 7 (static) · Tailwind CSS v4 · GSAP + ScrollTrigger · Typst (PDF) ·
GitHub Actions → GitHub Pages

Node ≥ 22.12 required by Astro 7.

## Commands

```bash
npm run dev       # dev server
npm run build     # static build to dist/
npm run preview   # serve dist/ locally
npm run check     # astro check — CI runs this before deploying
npm run resume    # compile src/resume/resume.typ -> public/resume.pdf
npm run fonts     # copy Open Sans out of node_modules -> public/fonts/ (committed)
npm run icons     # regenerate the favicon set from the brand mark (committed)
```

Deploys happen on push to `main`. Nothing is published from a local machine.

## Conventions

- **Astro 7 API only.** Content collections are declared in
  `src/content.config.ts` using the Content Layer API (`loader: glob(...)`).
  Do not use the pre-5 `src/content/config.ts` path or the legacy
  `defineCollection({ type: 'content' })` form. `output: "hybrid"` no longer
  exists — `"static"` is the default and covers it.
- **`src/data/site.ts` gates unfinished phases.** Nav and CTAs read those flags,
  so the site never links to a page or file that has not shipped. Flip a flag in
  the same change that ships the thing.
- **Tailwind v4 only.** Wired through `@tailwindcss/vite` in `astro.config.mjs`
  plus `@import "tailwindcss"` in `src/styles/global.css`. There is no
  `tailwind.config.js` — theme values are declared with `@theme` in CSS.
  Never add the deprecated `@astrojs/tailwind` integration.
- **`src/data/cv.json` is the single source of truth** for anything that appears
  in both the website and `resume.pdf` (experience, skills, education, contact,
  availability). JSON Resume-shaped. Never hardcode CV facts into `.astro`
  files, and never edit the same fact in two places.
- **Colors come from CSS custom properties**, defined once in `global.css` for
  the light and dark palettes. No raw hex values in components.
- **Colour is rationed to four jobs:** the primary action, the availability
  dot, the glow behind the hero product shot, and hover states. Everything else
  is greyscale. That ratio is what makes the blue read as meaning; spending it
  on a fifth thing devalues the other four. `--color-accent` is for text, links
  and icons; `--color-accent-solid` is for filled surfaces and stays the darker
  blue in both themes, because white on the light dark-mode accent is only
  3.0:1. Never fill a button with `--color-accent`.
  **Accent text only ever appears on white.** On the light theme's tinted ground
  it measures 4.40:1 and fails AA; on a card or the nav bar it is 4.79:1. That
  is why the nav bar is `--color-surface` rather than a translucent tint of the
  page, and why `.btn-secondary` darkens its border on hover instead of turning
  blue.
- **Six type roles, no arbitrary sizes.** `text-meta` (14) · `text-body` (15) ·
  `text-subhead` (16/600) · `text-heading` (18/700) · `text-lead` (18) ·
  `text-display` (clamp, 32→44). Never write `text-[15px]` or reach for
  Tailwind's default `text-sm`/`text-xl` ramp — it bypasses the scale. The
  values were retuned once, wholesale, in `@theme`; the roles did not change and
  no component was touched. That is the test any future change to the scale has
  to pass.
- **The layout is a tinted ground with white cards on it.** Every section on
  every page is a `.card` — 8px radius, 1px `--color-subtle` edge, no shadow,
  24px of padding, 20px between plates. `Section.astro` and `PageHeader.astro`
  already are one; page wrappers are `mx-auto max-w-page space-y-5 px-6 pt-6
  pb-8` and own all the vertical rhythm, so a section never carries its own
  outer margin. Elevation is deliberately absent: a shadow implies something
  can be picked up, and none of these can.
- **`--color-subtle` is the one soft grey** and it does three jobs: card edges,
  the hairline under a section title, and the plate behind a `.tag` or a code
  span. `--color-border` stays the stronger grey for controls, inputs and image
  frames. A hairline *inside* a card is `subtle`; at `border` it reads as a
  second card edge.
- **Anything filled with `--color-surface` must not sit on a card** — the card
  is that colour, so it would be white on white. Inset things (form fields,
  empty-image frames, the placeholder cover) take `--color-bg` instead.
- **Open Sans, self-hosted, latin only.** `public/fonts/*.woff2` are copied out
  of `@fontsource-variable/open-sans` by `npm run fonts` and committed, the same
  arrangement as the icons — a bundled font gets a content hash, and the preload
  in `BaseLayout.astro` needs a path that is knowable before the build. One
  variable file covers 300–800. Regenerate in the same change as any version
  bump. The OG cards use the static `@fontsource/open-sans` woff instead,
  because Satori reads neither woff2 nor a variable axis.
- **Every section uses the same three roles**, which is what makes them look
  like each other: `subhead` for the entry title or skill category, `body` for
  its description, `meta` for dates, tags and notes. Do not give one section its
  own sizes.
- **One measure, centred.** `max-w-page` and `max-w-wide` are both 56rem:
  `page` is the reading column, `wide` is the hero visual and the nav bar, and
  they are equal on purpose so every left and right edge on the page lines up.
  Horizontal padding is `px-6` everywhere. Gutters are symmetric because the
  measure *is* the container — **never nest a narrower `max-w-*` inside
  `max-w-page`**, not even to shorten paragraph lines. That is what left the old
  layout with 396px of dead space on the right, and it is the one fix that must
  not be reached for here. If the measure has to change, change
  `--container-page` and let the whole page move with it.
  This is a deliberate trade, not an oversight: inside a card the column is
  798px, which measures **111ch** on the rendered page — past the comfortable
  range for long-form prose, and justified text pays most because wider lines
  open wider word spaces. `.prose-block` carries `line-height: 1.75` to
  compensate. It was 41rem/75ch before; widening to match the hero was an
  explicit design call, and the CV platform this layout is drawn from lands on
  110ch by a different route, so the measure is not what separates them.
- **Body prose is justified** via the `.prose-block` class, which pairs
  `text-align: justify` with `hyphens: auto` and drops to ragged-left below
  34rem. Apply it to multi-line prose only — never headings, chips, or labels.
- **Images** go through `astro:assets` (`<Image />` / `getImage`). Exception:
  the hero canvas frame sequence, which is fetched directly.
- **Brand assets.** `src/assets/brand/logo.svg` is the ESM monogram and the only
  copy of that artwork in the repo. It carries no background plate and fills
  with `currentColor`, so the header mark follows the theme and takes the accent
  on hover along with the name beside it. `BrandMark.astro` inlines it with
  `?raw` rather than restating the paths — never paste path data into a
  component. `public/favicon.ico` (multi-resolution, 16→256),
  `apple-touch-icon.png`, `icon-192` and `icon-512` are generated from that same
  file by `npm run icons`; they are committed, not built, and must be
  regenerated in the same change as any edit to the mark. Those get a solid ink
  plate because an app icon lands on surfaces this repo does not control — iOS
  composites transparency to black. Originals live in `Images/` and are not what
  the site reads.
- **There is one project page template and there must never be a second.**
  `src/pages/projects/[slug].astro` builds a page from every non-draft file in
  `src/content/projects/`, so a new project is a markdown file and nothing
  else — no route, no component. Anything that tempts you to hand-write one
  project's page belongs in the collection schema as a field.
  The two halves are joined by slug in `src/lib/projects.ts`: `cv.json` owns
  name, year, summary and tags because `resume.pdf` prints them, and the
  frontmatter deliberately cannot restate any of the four. Ordering comes from
  the `cv.json` array so the site and the PDF agree on which project leads.
  Three things fail the build on purpose rather than shipping quietly: a slug
  with no matching file, a file with no matching slug, and a published
  (`draft: false`) write-up that still contains the word `TODO`. Drafts render
  in `npm run dev` and are absent from `npm run build`, and a project only
  becomes a link once its write-up is published — `getLinkedSlugs()` derives
  that, so nothing has to be flipped in two places.
- **Rendered markdown is styled by `.prose-doc` in `global.css`**, the one
  place the site styles elements by tag name — a write-up's headings arrive
  with no class to hang a utility on. Every value it sets comes from the same
  six type roles, so an `<h2>` in a write-up is the identical 18/700 plus
  hairline that `Section.astro` renders. Never add a size there.
- `public/resume.pdf` is generated by `src/resume/resume.typ` from the same
  `cv.json` the site renders. It is gitignored and must not be committed, and
  the `.typ` is never hand-edited to say something `cv.json` does not.
- **The résumé sets `Open Sans` and compiles with `--ignore-system-fonts
  --font-path node_modules/@expo-google-fonts/open-sans`.** Typst embeds only
  four faces and none is a proportional sans, so the TTFs come from npm
  (`@expo-google-fonts/open-sans`, OFL) — pinned exactly by `package.json`, not
  committed. Same family as the site by design: the page and the PDF are one
  document to whoever reads both. The flag keeps whatever fonts a machine
  happens to have installed from leaking in: without it a layout approved
  locally would ship subtly different from the CI runner's. Typst is pinned to
  0.15.1 for the same reason. Typst only *warns* on an unresolvable family and
  falls back, so CI asserts the TTF exists before compiling.
  **Body size is 9pt and that number is load-bearing.** At 9.5pt the document
  still fits two pages but splits Technical Skills across the break; 9pt keeps
  every break on a section boundary. Re-render and look at both pages before
  changing any size in that file.
- **The accent bar beside the résumé header is the PDF's only colour**, and it
  is the same `--color-accent-solid` the site fills its primary button with.
  The same rationing rule applies: one job, one colour.

## Hard constraints

These are load-bearing. Do not trade them away for visual polish.

1. **Content works without JavaScript.** GSAP and the hero animation are
   progressive enhancement. Every page must be fully readable with JS disabled.
2. **Respect `prefers-reduced-motion: reduce`** — a complete static fallback,
   everywhere, not just the hero.
3. **Hero budget:** total assets < 2 MB, pin distance ≤ 250vh, name/title/CTAs
   visible at frame 0 and never gated behind the animation.
4. **Performance:** Lighthouse ≥ 95 across all categories on mobile; landing
   page JS ≤ 50 KB gzipped.
5. **Accessibility:** semantic landmarks, visible focus states, WCAG AA contrast
   in both themes, keyboard-navigable nav and forms.
6. **`base` stays `"/"`** — a custom domain is in use. `public/CNAME` must
   survive every deploy.

## IP boundary

This is a public repo for a hardware engineer. **Never commit or publish
employer or client schematics, Gerbers, PCB layouts, or firmware source.**
Project pages carry block diagrams, outcomes, and engineering reasoning only.
Ask before adding any artifact from contract work.

## Audience split

`/` is recruiter-facing: a clean CV, no freelance pitch. `/services` is
client-facing. Keep the framing of each page to its own audience.
