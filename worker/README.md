# ACE Content Studio — backend Worker

This Cloudflare Worker is the backend that makes `content-studio.html` actually
work. A static GitHub Pages site cannot hold your Anthropic API key or run the
Google OAuth flow, so those two jobs live here instead.

It does three things:

1. **Proxies the Anthropic API** — the browser sends the prompt to this Worker,
   the Worker adds your secret key and forwards it to Anthropic. The key never
   reaches the browser.
2. **Runs Google OAuth** — a one-time "Connect Google Calendar" flow that stores
   a refresh token so the tool can add events to your calendar.
3. **Creates calendar events** — one-tap scheduling of a full week of posts.

You only have to set this up once.

---

## What you need

- A **Cloudflare account** (free) and the `wrangler` CLI (`npm install -g wrangler`).
- An **Anthropic API key** from https://console.anthropic.com.
- A **Google Cloud project** with an OAuth 2.0 client (free).

---

## 1. Get the Worker running (no calendar yet)

```bash
cd worker
npm install            # installs wrangler locally (or use the global one)
wrangler login         # opens a browser to authorize Cloudflare
```

### 2. Create the KV namespace (stores the Google token)

```bash
wrangler kv namespace create ACE_KV
```

Copy the `id` it prints into `wrangler.toml`, replacing
`REPLACE_WITH_YOUR_KV_NAMESPACE_ID`.

### 3. Set your secrets

```bash
wrangler secret put ANTHROPIC_API_KEY   # paste your Anthropic key
wrangler secret put ACCESS_CODE         # invent a passphrase (e.g. "acegroup2026")
```

The `ACCESS_CODE` is what stops random visitors from spending your API budget.
Everyone using the studio types it once; the browser remembers it.

You can add the Google secrets now or in step 5.

### 4. Deploy

```bash
wrangler deploy
```

It prints a URL like `https://ace-content-studio.YOUR-SUBDOMAIN.workers.dev`.
**Copy that URL** — you'll paste it into `content-studio.html` (see the last
section). Content generation and live trends work as soon as this is deployed.

---

## 5. Add Google Calendar (the OAuth part)

1. Go to https://console.cloud.google.com → create/select a project.
2. **APIs & Services → Library →** enable **Google Calendar API**.
3. **APIs & Services → OAuth consent screen:**
   - User type: **External**.
   - Add your email (`rosie@acegroupny.com`) as a **Test user** so you can use
     it without Google verification.
   - Scope: `.../auth/calendar.events` (added automatically by the flow).
4. **APIs & Services → Credentials → Create credentials → OAuth client ID:**
   - Application type: **Web application**.
   - **Authorized redirect URI:** your Worker URL + `/auth/google/callback`,
     e.g. `https://ace-content-studio.YOUR-SUBDOMAIN.workers.dev/auth/google/callback`
   - Create it, then copy the **Client ID** and **Client secret**.
5. Give the secrets to the Worker and redeploy:

```bash
wrangler secret put GOOGLE_CLIENT_ID       # paste the client ID
wrangler secret put GOOGLE_CLIENT_SECRET   # paste the client secret
wrangler deploy
```

Now open the studio, click **Connect Google Calendar**, pick your Google
account, and approve. From then on, "Add week to Google Calendar" writes events
straight to your calendar.

> If Google ever says it didn't return a refresh token, remove ACE at
> https://myaccount.google.com/permissions and connect again.

---

## 6. Point the studio at the Worker

Open `content-studio.html` and set the one line near the top of the `<script>`:

```js
const WORKER_URL = "https://ace-content-studio.YOUR-SUBDOMAIN.workers.dev";
```

Commit and push. That's the only change the page needs.

---

## Cost & safety notes

- The `ACCESS_CODE` is the only thing between the public page and your API key.
  Keep it non-obvious and change it (`wrangler secret put ACCESS_CODE`) if it
  leaks.
- The Google refresh token is single-user: whoever connects last owns the
  calendar the events land in. For a one-person tool that's exactly what you
  want.
- Everything here runs on Cloudflare's and Anthropic's free/pay-as-you-go tiers;
  there's no server to keep running.
