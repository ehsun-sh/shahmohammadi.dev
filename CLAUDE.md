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
npm run fonts     # copy Noto Sans out of node_modules -> public/fonts/ (committed)
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
- **Six type roles, no arbitrary sizes.** `text-meta` (14) · `text-body` (14) ·
  `text-subhead` (16/600) · `text-heading` (18/700) · `text-lead` (18) ·
  `text-display` (clamp, 28→36). Never write `text-[15px]` or reach for
  Tailwind's default `text-sm`/`text-xl` ramp — it bypasses the scale. The
  values were retuned twice, wholesale, in `@theme`; the roles did not change
  and no component was touched. That is the test any future change to the scale
  has to pass. `meta` and `body` share 14px on purpose — a job's dates, its
  description and its bullets are all one size on the reference and are held
  apart by colour and weight — and they stay separate roles so they can move
  independently later.
  **`body { line-height }` in `@layer base` must equal
  `--text-body--line-height`.** Anything without an explicit `text-*` class
  inherits from there, so a mismatch renders two rhythms inside one card.
- **Body copy is ink; `--color-muted` is for chrome.** Descriptions, bullets,
  dates and the company line all take `--color-text`. The muted grey is for the
  nav, the footer, breadcrumbs, section notes, dev-only banners, placeholder
  text and the skill lists — the one content exception, because at that density
  full ink turns the block back into texture.
- **Bulleted lists are `.bullets`**: real `list-style: disc` with the native
  `::marker` in `--color-text`, 20px of padding-left, and no gap between items.
  Never draw a bullet with a positioned `::before` again — that only existed
  because the list was a flex column, and flex destroys `display: list-item`.
  `.prose-doc` lists use the same device with a little air between items.
- **An entry reads title → `company | dates` → tags → prose.** The stack sits
  third because it is the fastest thing to scan and a reader decides relevance
  from it before reading a sentence. The pipes are `aria-hidden` spans with
  horizontal margin, not literal text.
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
- **Noto Sans, self-hosted, latin only.** `public/fonts/*.woff2` are copied out
  of `@fontsource-variable/noto-sans` by `npm run fonts` and committed, the same
  arrangement as the icons — a bundled font gets a content hash, and the preload
  in `BaseLayout.astro` needs a path that is knowable before the build. One
  variable file covers 100–900. Regenerate in the same change as any version
  bump. The OG cards use the static `@fontsource/noto-sans` woff instead,
  because Satori reads neither woff2 nor a variable axis.
  It replaced Open Sans so the site and `resume.pdf` share a family again,
  after the résumé moved to the reference export's typeface. Nothing else had
  to move with it: Noto sets 1.01× wider — measured glyph by glyph out of the
  `hmtx` tables over the real strings, not eyeballed — so the measure, the type
  scale and the OG card's character clamp all held. Any future family change
  gets the same measurement first.
- **Grand Hotel is the second family and it sets exactly two lines:** the hero's
  thesis under the name on the title card, and "Designed by" on the closing
  plate. It reaches the page through `--font-script` and has those two consumers
  only — `.hero-tagline` and `.hero-kicker`, which are the same line at either
  end of one sequence, a short script over or under a large name. Setting one of
  them in the sans breaks the rhyme the two cards exist to make. It is not in
  `--font-sans`, and giving it a
  second job would turn a signature into a texture. Static 400 because the
  family has no other weight — never ask it for bold, the browser would
  synthesise a smear across a connecting script. Deliberately **not** preloaded:
  the face that has to be in the first round trip is the one the whole document
  is set in, and a second preload on all six pages to save one reflow on one
  line of one of them spends the wrong budget.
  It is set at 0.72 of the name, which is where Grand Hotel's ~0.62em cap lands
  within a few percent of Noto's 0.714. **The gap under the name is measured
  against the ink and not the boxes** — the name's unused descender band plus
  Grand Hotel's ascender clearance come to 0.164em of nothing, so the box gap is
  the visible gap minus that, and the tagline is hung out of the flow so the
  name stays exactly on the screen's centre line. On desktop the mark joins the
  flow beside the name and the lead's box then ends at the *mark's* foot, so the
  gap subtracts that overhang to keep the tagline the same distance from the
  name in both arrangements. Re-measure the ink if either size moves.
- **Every section uses the same three roles**, which is what makes them look
  like each other: `subhead` for the entry title or skill category, `body` for
  its description, `meta` for dates, tags and notes. Do not give one section its
  own sizes.
- **Two containers, and they exist to produce one measure.** `max-w-page` is
  48rem — the reading column, used by `/services`, `/contact`, `/projects`, the
  project pages and `/404`, and it puts body copy at ~100 characters a line.
  `max-w-wide` is 71rem and belongs to the landing page alone: a 20rem rail
  (`--container-rail`) + 20px + a main column that lands on 748px, measured at
  **104ch** — near enough `page` that the two read as one document. Below `lg`
  the rail stacks and the shell falls back to `max-w-page`, so a 1023px viewport
  never renders a 970px line.
  Horizontal padding is `px-6` everywhere. Gutters are symmetric because the
  measure *is* the container — **never nest a narrower `max-w-*` inside a
  container**, not even to shorten paragraph lines. That is what left the old
  layout with 396px of dead space on the right, and it is the one fix that must
  not be reached for here. If a measure has to change, move the container
  variable and let the page move with it; `--container-page` and `--text-body`
  move together, because dropping the body size without dropping the column took
  the line past 120 characters.
- **`BaseLayout`'s `shell` prop picks the container for the nav and footer**
  (`"page"` by default, `"wide"` on the landing page) so the header mark starts
  at exactly the same x as the card beneath it. Without it the bar would be
  71rem on all six pages and overhang the content by 184px a side on five.
- **The landing page has a rail; no other page does.** `ProfileCard.astro` is
  sticky at `lg:top-20`, holds the page's single `<h1>`, and carries the five
  facts a recruiter needs at any scroll position: who, where, availability,
  contact, and the PDF.
  **The portrait is two files, one per theme, and both ship.** A `<picture>`
  keyed on `prefers-color-scheme` would fetch one and be wrong for anyone who
  has used the theme toggle — the theme resolves from localStorage first — so
  the pair is rendered and the `dark` variant picks. Never give `.portrait` a
  `display` in the scoped block: Astro compiles it to
  `.portrait[data-astro-cid-…]`, which outranks Tailwind's `.hidden` and ships
  both portraits stacked. It is square, inset 16px from the card's top and
  sides, and capped at 22rem — not at the rail's own 286px, which would bind
  just under a phone's available width and leave the insets asymmetric, and
  would jump the size across the 34rem line where the card's padding steps
  24 → 16. `/services` and `/contact` address clients, and a
  "download my résumé" rail argues against the page it would sit on.
  `lg:items-start` on the grid is load-bearing — a stretched grid item gives
  `position: sticky` nothing to travel inside.
- **Body prose is justified** via the `.prose-block` class, which pairs
  `text-align: justify` with `hyphens: auto` and drops to ragged-left below
  34rem. Apply it to multi-line prose only — never headings, chips, or labels.
- **The hero is a title sequence, and it is symmetrical.** One pinned stage,
  four beats: a title card (mark, name, thesis, scroll cue) holds and dissolves
  while the product grows in behind it; the frames scrub; the product shrinks
  away while the closing plate grows in; the plate lifts out and the header
  fades up behind it. The last third runs the first third backwards on purpose,
  and every pair overlaps — a gap between two of them reads as two animations,
  an overlap reads as one handover. The map lives in one comment above
  `render()` in `HeroSequence.astro`; change a number there and nowhere else.
  **The header is absent for the whole sequence**, mark included, and arrives
  last on `--hero-chrome-opacity`. That is why the title card carries its own
  mark and name: the identity requirement in constraint 3 is met by the card,
  not by a half-dressed bar.
  **The card's every measurement is a ratio of the name**, and the name is
  `min(7.4vw, 5.25rem)` — no floor, because that coefficient exists to keep the
  longest name in `cv.json` on one line down to 312px and a floor is what breaks
  it. **The mark has two ratios and they are the same rule at two scales:**
  1.6018em beside the name, where its vertical edge measures the cap height of
  the E it sits next to, and exactly twice that stacked above it, where there is
  no E alongside for the relationship to be visible and the single ratio only
  makes the mark look like a badge. Derive, never nudge — and if the artwork
  changes, both move together because one is two of the other. Its `pointer-events` are released by
  `data-hero-passed` and not by the opacity rule, because a later `auto` loses
  to the more specific `none` — which shipped a visible bar nobody could click.
  Everything animated hangs off `data-hero-active`, which only the script sets,
  so **`html:not([data-hero-active])` is the real "not driving" condition** —
  reduced motion is only one of the two ways to get there, and keying a
  fallback on the media query alone leaves JS-disabled-but-motion-allowed
  broken. Anything the script writes is an inline custom property, so handing
  the page back mid-visit means removing those properties, not just the
  attribute.
- **Images** go through `astro:assets` (`<Image />` / `getImage`). Exception:
  the hero canvas frame sequence, which is fetched directly.
- **The hero frames are square and drawn `contain`, so the rendered size is
  `min(stageW, stageH)` — the viewport HEIGHT on any landscape screen.** Every
  sizing decision about the sequence follows from that one fact, and the two
  places that forgot it both shipped bugs. The tier picker measured
  `innerWidth`, which is the dimension not doing the work: it asked a 1920×1080
  desktop for 1920 when 1080 is drawn, and it asked a 390px phone for 780
  against a 720 tier — so it stepped up and **every phone but a 360px one
  downloaded the desktop set**, and the 2 MB budget was being enforced on a set
  almost nobody received. It now measures the drawn box and allows a tier to
  serve up to a 1.25× upscale, which is invisible on something moving every
  frame and is the right trade against tripling the bytes. The large tier is
  1280 for the same reason: 1440 was 33% more than a 1080p desktop can show.
  **Payload is pixels, and that is measured, not assumed** — at 1440, quality
  72 → 50 saves 16% and visibly smears the board, `alphaQuality` 100 → 80 saves
  4%, `smartSubsample` costs 5%, and dropping alpha entirely would save 21%.
  Frame count and width are the only real levers; reach for quality last.
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
- **The résumé sets `Noto Sans` and compiles with `--ignore-system-fonts
  --font-path node_modules/@expo-google-fonts/noto-sans`.** Typst embeds only
  four faces and none is a proportional sans, so the TTFs come from npm
  (`@expo-google-fonts/noto-sans`, OFL) — pinned exactly by `package.json`, not
  committed. Same family as the site — but arrived at from the other direction
  than before: the approved reference export is set in Noto Sans, matching it is
  what this document is for, and the site was moved onto it afterwards so the
  page and the PDF still read as one document to whoever opens both.
  The swap cost nothing else: both families descend from Droid Sans and their
  metrics agree to four places (cap-height 0.714em, ascender 1.069, descender
  0.293), so every spacing number survived it untouched. That is the test any
  future family change has to pass — measure the TTF's `OS/2` cap-height before
  swapping, and re-solve the spacings if it moves.
  The flag keeps whatever fonts a machine
  happens to have installed from leaking in: without it a layout approved
  locally would ship subtly different from the CI runner's. Typst is pinned to
  0.15.1 for the same reason. Typst only *warns* on an unresolvable family and
  falls back, so CI asserts the TTF exists before compiling.
- **The résumé's metrics are measured, not chosen.** Three sizes — 15pt name,
  10pt section heading, 8pt everything else, all bold-or-regular with nothing
  in between — on a 30pt margin, with 12.05pt between baselines and a 1pt rule
  under each heading. Every one of those numbers was recovered from
  `Docs/Ehsan Shahmohammadi CV 4.2.pdf`, a Reactive Resume export (Rhyhorn
  template) that was reviewed and approved, by inflating its content streams
  and replaying the text operators. Reproducing an approved document beats
  re-deriving it by eye, and it is why the file's header carries the full table
  of measured baseline deltas rather than a rationale.
  The identity that makes them solvable: Typst's text box runs cap-height to
  baseline, so `baseline(A)→baseline(B) = spacing + cap-height × size(B)`, and
  Open Sans' cap-height is 0.714em. Every `spacing`, `above` and `row-gutter`
  in that file is a measured delta with the next line's cap height subtracted
  out — **change a size and the spacings touching it have to be re-solved, not
  nudged.** Verify by re-measuring the output, not by looking at it.
  `par.spacing` is deliberately set to the *smallest* gap in the document, the
  one under a section rule, because Typst resolves a gap as
  `max(prev.below, next.above)` — a floor never wins an argument, so every
  larger gap can be declared as `above` on the block that wants it. Inside a
  container the reverse holds: Typst drops leading spacing at the start of one,
  so a first child's gap has to be set as `below` on the child before it.
  **Two of those measurements cannot be read off the stream at face value.**
  Chrome prints through Skia, and Skia draws a border by doubling the stroke
  width and clipping it back to a band of the real size — so the reference's
  section rules say `2 w` and are 1pt, and its accent bar says `10 w` and is
  5pt. Read the clip path, not the `w`. Weight is the other one: the reference
  embeds faces *named* SemiBold, but that is only the heaviest weight in a
  subsetted family asked for `bold`, and Open Sans SemiBold set against it
  reads visibly lighter. Everything bold in the résumé is 700.
- **Skills sits second, between the summary and Experience** — the reference's
  order, and the right one here: a hardware CV is filtered on its stack before
  it is read for its story, so the list a screener matches against should not
  be two pages down. This is deliberately *not* the site's order, where
  Experience leads; the two are read differently and only `cv.json` has to
  agree.
- **An entry reads `company | location` then `position | dates`** — organisation
  first, because that is what a recruiter scans for, and the right column flush
  to the measure so the dates form their own column. Both rows are one grid, so
  a page break cannot strand a company name from its dates. Note this is *not*
  the site's order, which leads with the position; the two documents are read
  differently and only `cv.json` has to agree.
- **The résumé is set entirely in ink, with weight carrying the hierarchy.**
  The reference sets every glyph in pure black and spends its only colour on
  the header bar; a second grey at this density blurs the distinction rather
  than making one. **That bar is the PDF's only colour**, and it is the same
  `--color-accent-solid` the site fills its primary button with. The same
  rationing rule applies: one job, one colour. It stays that blue rather than
  the reference's `#155DFC`, because agreeing with the site is the whole reason
  the résumé has a palette at all — the same argument that put it in Open Sans.
- **No phone number, here or in `cv.json`.** This repo is public and
  `resume.pdf` is served from a public URL. The reference export carries one
  because it lives behind an account; email and the site are the contact path.

## Hard constraints

These are load-bearing. Do not trade them away for visual polish.

1. **Content works without JavaScript.** GSAP and the hero animation are
   progressive enhancement. Every page must be fully readable with JS disabled.
2. **Respect `prefers-reduced-motion: reduce`** — a complete static fallback,
   everywhere, not just the hero.
3. **Hero budget:** total assets < 2 MB, pin distance ≤ 300vh, name/title/CTAs
   visible at frame 0 and never gated behind the animation. The ceiling was
   250vh while the opening title card was a separate screen ahead of the pin;
   folding the card in as a beat made the *hero* shorter — 400vh against the
   450 a screen plus a 350vh pin cost — while giving the frames the same ~23px
   of scroll per frame they had before. Longer pin, shorter page, and one
   continuous piece instead of a screen that scrolls away followed by an
   animation that starts. **If another beat is ever added, the section grows to
   pay for it; it does not come out of the frames.**
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
