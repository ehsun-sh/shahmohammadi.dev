# Deploying shahmohammadi.dev

One-time setup, in order. Steps 1–3 must happen before the first deploy will
serve on the custom domain; step 5 cannot be done until step 4 finishes.

---

## 1. Create the repo and push

The repo can have any name — the custom domain is what decides the URL, not the
repo name. `shahmohammadi.dev` keeps it obvious.

```bash
gh repo create shahmohammadi.dev --public --source=. --remote=origin --push
```

If the repo is **private**, GitHub Pages requires a paid plan. See ROADMAP Q5.

## 2. Point Pages at Actions

Repo → **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Do not pick "Deploy from a branch". `.github/workflows/deploy.yml` publishes
through `actions/deploy-pages`, and the branch option would fight it.

## 3. DNS records at your registrar

Two sets. The apex needs A and AAAA records because a CNAME is not legal at a
zone apex; `www` gets a CNAME.

**Apex — `shahmohammadi.dev`**

| Type | Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |

**Subdomain — `www`**

| Type | Name | Value |
|---|---|---|
| CNAME | `www` | `<your-github-username>.github.io` |

Add all four A records and all four AAAA records. GitHub load-balances across
them; a partial set works until the one host you configured has a bad day.

Verify propagation before moving on:

```bash
dig +short shahmohammadi.dev A
```

## 4. Set the custom domain in the repo

Repo → **Settings → Pages → Custom domain** → `shahmohammadi.dev` → Save.

`public/CNAME` already contains the domain and the build copies it into `dist`,
which is what keeps the domain attached on every subsequent deploy. The workflow
asserts the file survived the build, because when it silently disappears the
symptom is a dead domain rather than a failed build.

GitHub then runs a DNS check and issues a Let's Encrypt certificate. This
usually takes a few minutes and can take up to 24 hours.

## 5. Enforce HTTPS

Once the certificate is issued, the **Enforce HTTPS** checkbox on the same page
becomes available. Tick it. It is greyed out until the certificate exists —
that is expected, not a misconfiguration.

---

## Verifying a deploy

```bash
curl -sSI https://shahmohammadi.dev | head -n 1
```

Then check the things that are easy to get silently wrong:

- `https://shahmohammadi.dev/og.png` returns a 1200×630 PNG
- `https://shahmohammadi.dev/sitemap-index.xml` resolves
- `https://shahmohammadi.dev/robots.txt` lists the sitemap
- `https://shahmohammadi.dev/favicon.ico` resolves
- Paste the URL into the [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
  to confirm the social card renders and to prime LinkedIn's cache

## Routine deploys

Push to `main`. That is the whole process. The workflow type-checks, builds,
verifies the CNAME, and publishes.

To deploy without a code change (for example after editing repo settings), use
**Actions → Deploy to GitHub Pages → Run workflow**.

## When something breaks

| Symptom | Cause |
|---|---|
| Domain reverts to `<user>.github.io` after a deploy | `dist/CNAME` missing — the workflow's verify step should have caught this |
| 404 on every path | Pages source still set to a branch instead of GitHub Actions |
| CSS and assets 404 but HTML loads | `base` in `astro.config.mjs` is not `/` |
| Certificate never issues | A/AAAA records incomplete, or an old CAA record blocks Let's Encrypt |
| Build fails only in CI | Node version — Astro 7 needs ≥ 22.12; the workflow pins 22 |
