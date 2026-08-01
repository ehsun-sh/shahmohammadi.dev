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
- **Six type roles, no arbitrary sizes.** `text-meta` (14) · `text-body` (17) ·
  `text-subhead` (17/600) · `text-heading` (18/600) · `text-lead` (22) ·
  `text-display` (clamp). Never write `text-[15px]` or reach for Tailwind's
  default `text-sm`/`text-xl` ramp — it bypasses the scale.
- **Two measures, both centred:** `max-w-page` (44rem) is the reading column and
  is what everything textual uses; `max-w-wide` (56rem) is for the hero visual
  and the nav bar only. Horizontal padding is `px-6` everywhere. Gutters are
  symmetric because the measure *is* the container — do not nest a narrower
  `max-w-*` inside `max-w-page`, which is what left the old layout with 396px of
  dead space on the right.
- **Body prose is justified** via the `.prose-block` class, which pairs
  `text-align: justify` with `hyphens: auto` and drops to ragged-left below
  34rem. Apply it to multi-line prose only — never headings, chips, or labels.
- **Images** go through `astro:assets` (`<Image />` / `getImage`). Exception:
  the hero canvas frame sequence, which is fetched directly.
- **Brand assets.** `src/assets/brand/logo.jpg` is the ESM monogram used in the
  header; `public/favicon.ico` is a multi-resolution icon covering 16→256, and
  `apple-touch-icon.png` / `icon-192` / `icon-512` are generated from the same
  logo. Originals live in `Images/` and are not what the site reads.
- `public/resume.pdf` is generated. It is gitignored and must not be committed.

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
