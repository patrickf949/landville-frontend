# Deploying the LandVille frontend (free tier)

Angular 22 (SSR-capable). The cheapest free option is to publish the client
bundle as a **static site** — free static hosting doesn't spin down, unlike
free Node web services.

## Before you deploy
Set your deployed backend URL in `src/environments/environment.prod.ts`:

```ts
api_url: 'https://landville-backend.onrender.com/api/v1'
profileUrl: 'https://landville-backend.onrender.com/api/v1/auth/profile/'
```

(Then make sure the backend's `CORS_WHITELIST` / `CSRF_TRUSTED_ORIGINS` include
this frontend's URL.)

## Option A — Render static site (default, `render.yaml`)

1. Push this repo to GitHub.
2. Render → *New +* → *Blueprint* → pick the repo. It reads `render.yaml`:
   - build: `npm ci && npm run build`
   - publish: `dist/landville-frontend/browser`
   - SPA rewrite `/* → /index.html` so client routes resolve.
3. Deploy. Done — static sites are free and always-on.

## Option B — Netlify (`netlify.toml`)

Connect the repo on Netlify; it auto-detects `netlify.toml` (same build +
publish + SPA redirect). Vercel/Cloudflare Pages work the same way — build
`npm run build`, publish `dist/landville-frontend/browser`, add a catch-all
rewrite to `/index.html`.

## Option C — true SSR (Node web service)

The app is SSR-ready (`server.ts`). To render on the server instead of the
client, deploy as a **Node web service** (Render free web service, spins down
on idle) rather than a static site:

- build: `npm ci && npm run build`
- start: `node dist/landville-frontend/server/server.mjs`
- Node version: 24 (`.nvmrc`)

Use static (Option A) unless you specifically need SSR for SEO/first-paint.

## Local run

```bash
npm install
npm run dev        # http://localhost:4200 (proxies /api to localhost:8000)
```

`proxy.conf.json` forwards API calls in dev; in production the app calls
`environment.prod.ts` `api_url` directly.
