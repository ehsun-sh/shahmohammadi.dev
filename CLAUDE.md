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
- **Six type roles, no arbitrary sizes.** `text-meta` (14) · `text-body` (15) ·
  `text-subhead` (17/600) · `text-heading` (24/600) · `text-lead` (20) ·
  `text-display` (clamp). Never write `text-[15px]` or reach for Tailwind's
  default `text-sm`/`text-xl` ramp — it bypasses the scale.
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
  This is a deliberate trade, not an oversight: 56rem puts body copy at **104ch**,
  past the comfortable range for long-form prose, and justified text pays most
  because wider lines open wider word spaces. `.prose-block` carries
  `line-height: 1.75` to compensate. It was 41rem/75ch before; widening to match
  the hero was an explicit design call.
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
- `public/resume.pdf` is generated by `src/resume/resume.typ` from the same
  `cv.json` the site renders. It is gitignored and must not be committed, and
  the `.typ` is never hand-edited to say something `cv.json` does not.
- **The résumé sets `Almarai` and compiles with `--ignore-system-fonts
  --font-path node_modules/@expo-google-fonts/almarai`.** Typst embeds only
  four faces and none is a proportional sans, so the TTFs come from npm
  (`@expo-google-fonts/almarai`, OFL) — pinned by `package-lock`, not committed.
  The flag keeps whatever fonts a machine happens to have installed from
  leaking in: without it a layout approved locally would ship subtly different
  from the CI runner's. Typst is pinned to 0.15.1 for the same reason. Typst
  only *warns* on an unresolvable family and falls back, so CI asserts the TTF
  exists before compiling. Almarai ships no italic — never ask the layout for
  one, or Typst will synthesise a slant.
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
