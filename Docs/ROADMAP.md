# shahmohammadi.dev — Roadmap

Personal portfolio, live CV, and services site for Ehsan Shahmohammadi
(Hardware & Embedded Systems Engineer).

Supersedes `Docs/Portfolio_Architecture_Blueprint.pdf`. Where the two disagree,
this file wins. See the "Deviations from the blueprint" section for why.

---

## 0. Locked decisions

| Decision | Value | Notes |
|---|---|---|
| Domain | `shahmohammadi.dev` | Custom domain on GitHub Pages. `base: "/"`, `site: "https://shahmohammadi.dev"`. Requires `public/CNAME`. |
| Repo name | `shahmohammadi.dev` | Any name works with a custom domain; naming it after the domain keeps things obvious. |
| Framework | Astro 7 (static output) | Latest stable as of 2026-07 — the blueprint's "Astro 5" is two majors behind. Content Layer API and `src/content.config.ts` are unchanged; `output: "hybrid"` was removed. |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` | The `@astrojs/tailwind` integration is deprecated and must not be used. |
| Animation | GSAP + ScrollTrigger, hybrid SVG/canvas | Loaded only on the landing page, only above the mobile breakpoint, only when motion is allowed. |
| CV source of truth | `src/data/cv.json` | Consumed by both the Astro site and the Typst PDF build. Never duplicated. |
| PDF engine | Typst | Via `typst-community/setup-typst` in CI. Reads `cv.json` with Typst's native `json()`. |
| Deploy | GitHub Actions → `actions/deploy-pages` | Official Pages flow with OIDC, not `peaceiris/actions-gh-pages`. |
| Language | English only for v1 | See open question Q1. |
| Analytics | GoatCounter or Cloudflare Web Analytics | Privacy-friendly, no cookie banner needed. |
| Contact backend | Web3Forms | Static-host friendly; no server. |

---

## 1. Site map

```
/                     Landing — hero animation + CV (experience, skills, education, featured projects)
/projects             Index of engineering projects
/projects/[slug]      Project detail: overview, block diagram, PCB specs, validation data, downloads
/services             What I do for clients, engagement model, availability
/contact              Form + direct channels
/notes                Technical writing index
/notes/[slug]         Individual note
/resume.pdf           Auto-generated, always in sync with cv.json
/404
```

### Two audiences, two entry points

The landing page serves **recruiters and hiring managers**: a clean CV, a
download button, project links. It stays free of freelance-pitch language.

`/services` serves **clients**. It is a separate page so that the same site can
be shared with either audience without one undermining the other, and so the
services URL can be sent directly to a prospect.

`/services` content requirements:

- Concrete deliverables, not adjectives. Example scope lines: schematic capture
  and PCB layout (up to 6 layers; DDR, USB, Ethernet, RF front-ends); full DFM
  package (Gerber, BOM, pick-and-place, assembly drawing); firmware bring-up
  (STM32/ESP32, FreeRTOS, BLE/CAN/Modbus); EMC pre-compliance debugging;
  enclosure and mechanical fit.
- Engagement models: fixed-scope, hourly, and retainer — with what each suits.
- What the client must supply before work starts (requirements doc, mechanical
  constraints, target certifications, volume).
- Typical timelines per engagement type.
- An availability line ("Available for new projects — Q4 2026" or "Not taking
  new projects"). One line, high trust value, must be kept current.
- **No public rate card.** Quote per engagement.

---

## 2. Phases

Ordered so that a presentable site exists after Phase 2, and the highest-risk
work (the hero animation) lands after the site already has value. The blueprint
had the animation at Phase 3 of 5; that ordering risks never shipping.

### Phase 1 — Foundation ✅
- [x] `git init`, Astro 7 scaffold, Tailwind v4 via `@tailwindcss/vite`
- [x] `astro.config.mjs`: `site`, `base: "/"`, sitemap integration
- [x] `public/CNAME` containing `shahmohammadi.dev`
- [x] Design tokens in `src/styles/global.css` (light/dark palettes from
      blueprint §6, exposed as CSS custom properties + Tailwind `@theme inline`)
- [x] `src/content.config.ts` — `projects` and `notes` collections, Content
      Layer API, Zod schemas
- [x] `src/data/cv.json` + `src/data/cv.ts` (build-time Zod validation)
- [x] `BaseLayout.astro`, `Navigation.astro`, `Footer.astro`, `Section.astro`
- [x] Dark mode via `prefers-color-scheme` + manual toggle, no flash on load,
      working with JS disabled
- [x] `src/data/site.ts` feature flags so nav never links to an unbuilt page
- [x] 404 page, `robots.txt`, favicon
- [ ] **Fill in `src/data/cv.json` — every `TODO` placeholder.** Blocks Phase 2.

**Done when:** `npm run build` succeeds and `npm run preview` serves a themed,
navigable shell. *(Build verified; content still placeholder.)*

### Phase 2 — CV landing page + ship
- [x] Landing page reads entirely from `cv.json`
- [x] **Static** hero (name, title, one-line positioning, CTAs). No GSAP yet.
- [x] Sections: Experience, Skills, Projects, Education, Awards, Certifications
- [x] SEO: JSON-LD `Person` + `ProfilePage`, per-page meta, `sitemap-index.xml`,
      `robots.txt`, favicons and web manifest
- [x] OG image generated at build time (satori + resvg, embedded Inter so the
      PNG is identical on Windows and on the CI runner) at `/og.png`
- [x] Deploy workflow (`.github/workflows/deploy.yml`): `npm ci`, type check,
      `permissions:` block with OIDC, CNAME assertion, `upload-pages-artifact`
      + `deploy-pages`
- [x] Analytics component, off by default — set `site.analytics` to opt in
- [ ] **Create the repo, push, and complete DNS.** See `Docs/DEPLOY.md`.
- [ ] Fill the remaining `TODO`s in `cv.json` (LinkedIn and GitHub URLs, plus
      any social profiles worth keeping)

**Done when:** `https://shahmohammadi.dev` is live over HTTPS with a real CV.
**This is the first shippable milestone. Do not skip past it.**

### Phase 3 — Services + Contact
- [ ] `/services` per the content requirements above
- [ ] `/contact` with Web3Forms, honeypot field, success/error states
- [ ] Direct channels: email (obfuscated or form-only to limit scraping),
      LinkedIn, GitHub
- [ ] Availability line wired to a single field in `cv.json`

### Phase 4 — PDF pipeline
- [ ] `src/resume/resume.typ` reading `../data/cv.json` via `json()`
- [ ] Print-appropriate layout (1–2 pages, ATS-parseable text, no icon fonts)
- [ ] CI step with `typst-community/setup-typst`, output to `public/resume.pdf`
      **before** the Astro build so it is copied into `dist/`
- [ ] `public/resume.pdf` added to `.gitignore` (generated, never committed)
- [ ] Local `npm run resume` script so the PDF can be checked without pushing

**Done when:** editing one field in `cv.json` changes both the site and the PDF
on the next push.

### Phase 5 — Project pages
This phase carries the most weight with technical readers. Budget accordingly.

- [ ] `ProjectLayout.astro` template
- [ ] Per-project content: problem statement, architecture/block diagram, PCB
      specs (layer count, stack-up, key ICs, power budget), design trade-offs
      and *why*, validation data (scope captures, thermal images, EMC pre-scan),
      "Rev A → Rev B: what changed and why"
- [ ] Optimized images through `astro:assets`
- [ ] First three projects: `hpm20`, `esp32-lte-tracker`, `poe-power-supply`

**IP/NDA constraint:** do not publish employer schematics, Gerbers, or layouts.
For work done under contract, publish block diagrams, outcomes, and the
engineering reasoning only. Confirm before each project page goes live.

### Phase 6 — Hero animation ("Concept to Production")
Four stages, not seven: **Schematic → PCB Layout → Assembled Board → Product.**

Hybrid implementation:
- Stages 1–2: SVG with `stroke-dashoffset` draw-on. Where possible, generated
  from **real** exported KiCad/Altium artwork — an authentic trace is evidence,
  a decorative one is not. Near-zero payload.
- Stages 3–4: short canvas frame sequence (~40 WebP frames) for the parts where
  photorealism matters — metallic reflections, enclosure.

Hard constraints:
- Total hero asset budget **< 2 MB**. (The blueprint's "30 frames / 1.5 MB" is
  not achievable: 30 frames across 7 stages is visibly choppy, and realistic
  isometric WebP renders run 80–200 KB each, i.e. 10–20 MB for a smooth run.)
- Pin distance **≤ 250vh**. Name, title, and CTAs are visible at frame 0 and are
  never gated behind the animation.
- Full static fallback under `prefers-reduced-motion: reduce`, below 768px, and
  if GSAP fails to load. The site must be complete without any JS.
- First frame preloaded; remaining frames lazy-decoded so LCP is unaffected.

### Phase 7 — Notes + interactive PCB explorer
- [ ] `/notes` collection, RSS feed
- [ ] Interactive PCB explorer: clickable hotspots on a board render revealing
      subsystem, part choice, and rationale. Written once, reused per project —
      unlike the hero animation, this scales and demonstrates depth rather than
      polish.

---

## 3. Non-negotiable constraints

1. **No JS required for content.** Every page must be fully readable with
   JavaScript disabled. GSAP is progressive enhancement only.
2. **`prefers-reduced-motion` is respected everywhere**, not just the hero.
3. **One source of truth for CV data.** If a fact appears in both the site and
   the PDF, it lives in `cv.json`.
4. **Performance budget:** Lighthouse ≥ 95 on all four categories, mobile.
   Landing page JS ≤ 50 KB gzipped after the animation ships.
5. **Accessibility:** semantic landmarks, visible focus states, WCAG AA contrast
   in both themes, keyboard-navigable nav and forms.
6. **No employer IP published without confirmation.**

---

## 4. Deviations from the blueprint

| Blueprint | Here | Reason |
|---|---|---|
| 7 animation stages | 4 | 7 stages needs 400–600vh of pinned scroll, which contradicts the blueprint's own "value proof in under 10 seconds" goal. |
| 30-frame canvas, ~1.5 MB | Hybrid SVG + ~40 frames, < 2 MB | Original numbers are internally inconsistent; see Phase 6. |
| Animation at Phase 3 | Phase 6 | Highest-risk, highest-effort, lowest-marginal-value item. Ship first, decorate later. |
| Astro 5 | Astro 7 | 5 is two majors behind as of 2026-07. |
| `src/content/config.ts` | `src/content.config.ts` | Content Layer API path. |
| `@astrojs/tailwind` implied | `@tailwindcss/vite` | Tailwind v4; the integration is deprecated. |
| `peaceiris/actions-gh-pages@v3` | `actions/deploy-pages` | Official Pages flow; the blueprint's workflow also omits `npm ci` and `permissions:`. |
| `npx typst compile` | `typst-community/setup-typst` | `npx typst` does not resolve reliably. |
| Workflow named both `build-pdf.yml` and `deploy.yml` | `deploy.yml` | Blueprint contradicts itself between §4 and §5. |
| No `cv.json` in the tree | `src/data/cv.json` | Blueprint promises "JSON CV data" but never places the file. |
| No SEO, analytics, contact, or a11y plan | Phases 2, 3, and §3 | Absent entirely from the blueprint; for a job-seeking site these outrank the animation. |

---

## 5. Open questions

- **Q1 — Language.** English-only for v1 is the current assumption. If the
  services page is meant to reach Iranian clients, a Persian `/fa/` route is
  worth adding via Astro's built-in i18n routing, with RTL handled by Tailwind
  logical properties. Decide before Phase 3, since retrofitting RTL after the
  layout is built is expensive.
- **Q2 — Full-time vs freelance emphasis.** Current plan keeps the landing page
  recruiter-facing and freelance framing confined to `/services`. Revisit if the
  priority shifts.
- **Q3 — Which projects are publishable** under existing NDAs. Blocks Phase 5.
- **Q4 — 3D board renders.** Are Altium 3D exports available for the Phase 6
  frame sequence, or do they need to be produced?
- **Q5 — Phone number and repo visibility.** `src/data/cv.json` currently holds
  the phone number, marked "PDF only". That protects it from the HTML pages but
  **not** from `/resume.pdf`, which is a public URL, nor from a public GitHub
  repo where `cv.json` and `Docs/Resume.MD` are readable. A number on a public
  URL gets scraped in a way an emailed résumé does not. Three options, pick one
  before Phase 2 deploys:
  1. Accept it — treat the number as public.
  2. Drop the phone from `cv.json` entirely; keep a separate private résumé for
     direct applications. The site keeps email + contact form.
  3. Keep the repo private (GitHub Pages on private repos needs a paid plan) or
     inject the number from an Actions secret at PDF build time only.
