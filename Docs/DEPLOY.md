# Deploying shahmohammadi.dev

GitHub Actions builds; Cloudflare serves. The site is a Worker with static
assets — `wrangler.jsonc` names it `shahmohammadi` and points it at `dist/`.

Routine deploys are just `git push`. Everything below the first section is
one-time setup, kept because it is what a rebuild from scratch would need and
because two of the steps are easy to get subtly wrong.

---

## Routine deploys

Push to `main`. That is the whole process: the workflow type-checks, compiles
the résumé PDF with a pinned Typst, builds, asserts the PDF and `_headers`
survived into `dist/`, and runs `wrangler deploy`.

**Push to any other branch and you get a preview instead** — the same build,
uploaded as a version rather than deployed, at

```
https://<first-8-of-version-id>-shahmohammadi.<account>.workers.dev
```

The version ID is in the run log (`Worker Version ID: …`). Preview URLs must be
enabled once per Worker under **Settings → Domains & Routes → Preview URLs**;
without that the URL 404s.

That split is deliberate: `wrangler deploy` on a branch would publish it to the
live domain. It is two commands in the workflow, not one command with a flag.

To deploy without a code change, use **Actions → Deploy to Cloudflare → Run
workflow** on `main`.

---

## Why Cloudflare and not GitHub Pages

One reason, and it is `public/_headers`.

Pages sends `Cache-Control: public, max-age=0, must-revalidate` on everything
and offers no way to change it. This site ships ~7 MB of hero frames and a
self-hosted font at **fixed, unhashed paths** — the font has to be preloadable
from the HTML, so its URL must be knowable before the build, and the frame URLs
are built from a frame number by script. Under Pages that payload was
re-validated on every visit and could not be cached.

They are now `immutable` for a year. Everything else followed: real security
headers, unlimited bandwidth for an image-heavy site, and per-branch previews.

**`immutable` on an unhashed path is a promise the build makes, not a guarantee
the filename gives.** If the hero is ever re-rendered in a way that must reach
existing visitors, the fix is a new path (`/hero2/`), not a shorter `max-age`.

---

## One-time setup

### 1. The Worker

Cloudflare dashboard → **Workers & Pages → Create → Upload your static files**.
This creates a Worker with static assets, not a Pages project — hence a
`*.workers.dev` URL. `wrangler.jsonc`'s `name` must match it exactly; a
mismatch does not fail, it silently creates a *second* Worker.

Upload anything to get the project created. The first CI run replaces it.

### 2. Repository secrets

Repo → **Settings → Secrets and variables → Actions**:

| Secret | Where to find it |
|---|---|
| `CLOUDFLARE_API_TOKEN` | My Profile → API Tokens → Custom token, permission **Account → Workers Scripts → Edit** |
| `CLOUDFLARE_ACCOUNT_ID` | Workers & Pages → right-hand column |

The permission is **Workers Scripts**, not Cloudflare Pages. Pages is a
different product and its token is rejected here.

### 3. DNS — the zone first, the domain second

These are two different screens and the order is not optional.

**Account level → Domains → Add a Domain.** This makes Cloudflare the
authoritative DNS for the zone, and it is the *only* place the nameservers are
shown. Cloudflare scans the existing records; check the
`google-site-verification` TXT came across.

Then set those two nameservers at the registrar (Porkbun → Domain Management →
Authoritative Nameservers), replacing the registrar's own. Wait for Cloudflare
to mark the zone active.

**Then** Worker → **Settings → Domains & Routes → Add Custom Domain** →
`shahmohammadi.dev`. Cloudflare creates the DNS record itself, which is why the
zone has to be on Cloudflare first.

> **Delete every A, AAAA and CNAME record at `@` and `www` before this step.**
> Add Custom Domain refuses to run while any record exists at the hostname, and
> reports it as *"already has externally managed DNS records"* — which is
> misleading once the zone is already on Cloudflare. It means "a record is in
> the way", not "your DNS is elsewhere". Keep the TXT.

Finally set **SSL/TLS → Full (strict)**.

### 4. Turn GitHub Pages off

Repo → **Settings → Pages → Source: None**. Nothing deploys there any more, but
while it is enabled it will keep serving its last build to anyone holding a
cached DNS answer.

---

## Verifying a deploy

```bash
curl -sI https://shahmohammadi.dev | head -1
```

Then the things that are easy to get silently wrong:

```bash
# Caching — the reason the site is here at all
curl -sI https://shahmohammadi.dev/hero/w720/000.webp | grep -i cache-control
# want: public, max-age=31536000, immutable

# No redirects on internal routes (every link must be slashed)
curl -so /dev/null -w '%{http_code} %{num_redirects}\n' https://shahmohammadi.dev/projects/
# want: 200 0
```

- `/og.png` returns a 1200×630 PNG
- `/sitemap-index.xml` resolves
- `/robots.txt` still lists the sitemap — Cloudflare **prepends** a managed
  block of AI-crawler rules to it, so the file is much longer than the one in
  `dist/`; ours survives underneath
- `/resume.pdf` is non-empty
- A nonsense path returns **404**, not 200 — `not_found_handling: "404-page"`
- Paste the URL into the [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
  to confirm the social card renders and to prime LinkedIn's cache

## When something breaks

| Symptom | Cause |
|---|---|
| A second Worker appeared | `name` in `wrangler.jsonc` does not match the real Worker |
| Deploy fails on auth | Token has the Cloudflare Pages permission instead of Workers Scripts |
| Add Custom Domain refuses | An A/AAAA/CNAME record still exists at that hostname |
| Domain resolves but TLS fails | Universal SSL still issuing on a new zone — minutes to a few hours |
| Assets revalidate on every visit | `dist/_headers` missing, or a `Cache-Control` was added to `/*` and is being appended to the specific rules |
| Every internal link 307s | A link is missing its trailing slash; `trailingSlash: 'always'` should have caught it in dev |
| CSS and assets 404 but HTML loads | `base` in `astro.config.mjs` is not `/` |
| Preview URL 404s | Preview URLs not enabled on the Worker |
| Build fails only in CI | Node version — Astro 7 needs ≥ 22.12; the workflow pins 22 |
