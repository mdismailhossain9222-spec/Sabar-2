# Custom Domain Setup — Sabr By Simran

This Worker (`sabar-2`) is currently served at:
**`https://sabar-2.mdismailhossain9222.workers.dev`**

When the client purchases a custom domain (e.g. `sabarbysimran.ae`), attach it
using the steps below. **No code changes are needed** — only Cloudflare
configuration.

---

## Prerequisites

1. The domain is **registered** (purchased from a registrar).
2. You are logged into the Cloudflare account that owns `sabar-2`
   (`mdismailhossain9222@gmail.com`'s account, ID `3a2233e4b285fd1c2f39fcbd2415e896`).
3. You have a Cloudflare API token with **Workers: Edit** scope
   (or you're logged into `wrangler`).

---

## Step 1 — Add the domain to Cloudflare

### Option A: Add via Cloudflare DNS (recommended)

If your registrar supports it, point the domain's nameservers to Cloudflare:

1. In the Cloudflare Dashboard, click **Add site**.
2. Enter the domain, e.g. `sabarbysimran.ae`.
3. Cloudflare scans and imports existing DNS records — review them.
4. Cloudflare displays **nameservers** (e.g. `lara.ns.cloudflare.com`).
5. Go to your registrar's DNS/domain settings and replace the nameservers
   with Cloudflare's.
6. Wait for the domain status to show **Active** in the dashboard
   (can take minutes to ~48h).

### Option B: Add without Cloudflare DNS

If you want to keep your registrar's DNS, add the domain to Cloudflare as
**"Secondary DNS"** or simply skip to Step 2 and create a **CNAME record**
at your registrar pointing to `sabar-2.mdismailhossain9222.workers.dev`.

---

## Step 2 — Attach the domain to the Worker

Run **one** of these commands:

```bash
# Option A — CNAME route (simplest)
npx wrangler routes create sabarbysimran.ae sabar-2.mdismailhossain9222.workers.dev

# Option B — www subdomain too
npx wrangler routes create www.sabarbysimran.ae sabar-2.mdismailhossain9222.workers.dev
```

Or do it in the Dashboard: **Workers → sabar-2 → Domains & Routes → Add domain**.

> If the domain is not yet a zone in your Cloudflare account, Wrangler will
> prompt you to add it first — accept the default to create the zone.

---

## Step 3 — Verify

```bash
# Custom domain should return 200
curl -sI https://sabarbysimran.ae

# www should work too (or redirect)
curl -sI https://www.sabarbysimran.ae

# The workers.dev URL still works (origin unchanged)
curl -sI https://sabar-2.mdismailhossain9222.workers.dev

# Confirm in the dashboard
# Workers → sabar-2 → Domains (should show "Active")
```

Expected: all return **HTTP 200** and responses carry a `CF-RAY` header
(confirming traffic is on Cloudflare's network).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `404` on custom domain | Domain not yet a Cloudflare zone | Add it (Step 1) then re-run Step 2 |
| `DNS probe failed` | Nameservers not updated at registrar | Update nameservers, wait for propagation |
| `52x` / `1xxx` error | Cloudflare error page, not the Worker | Check Dashboard → Events; verify route exists |
| `403` from Cloudflare | Origin not responding | Verify `sabar-2` is deployed and live |
| www doesn't resolve | No www record created | Add the `www.` route (Step 2) or a redirect rule |

---

## Notes

- The `wrangler.jsonc` `routes` field is intentionally **commented out** so
  deploys don't fail if the domain doesn't exist yet. Uncomment and redeploy
  only after the domain is attached.
- This Worker uses `not_found_handling: single-page-application`, so any
  path (e.g. `/product/x`) serves `index.html` — the custom domain inherits
  this automatically.