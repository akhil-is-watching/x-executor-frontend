# X Executor Frontend

Admin dashboard and public connect flow for the [X Executor Hub](../x-executor/apps/hub) API. Built with Bun, React 19, and Tailwind.

## Prerequisites

1. **Hub** running locally from the `x-executor` monorepo (MongoDB, Redis, X OAuth app configured).
2. **X Developer App** with OAuth 2.0 user context; callback URL on Hub:
   - Local: `http://localhost:3000/api/v1/oauth/x/callback`

## Environment

Copy `.env.example` to `.env`:

| Variable | Example | Purpose |
|----------|---------|---------|
| `PORT` | `5173` | Frontend server (Hub uses 3000) |
| `HUB_API_URL` | `http://localhost:3000` | Server proxy target for `/api/*` |
| `PUBLIC_HUB_API_URL` | *(empty)* | Client API base; empty = same-origin proxy |
| `PUBLIC_HUB_PUBLIC_BASE_URL` | `http://localhost:3000` | OAuth start URLs (must hit Hub) |

In **`x-executor/.env`** (Hub), set:

```bash
OAUTH_SUCCESS_REDIRECT_URL=http://localhost:5173/oauth/success
HUB_PUBLIC_BASE_URL=http://localhost:3000
```

## Development

```bash
# Terminal 1 — from x-executor repo
yarn install
yarn start:hub:dev

# Terminal 2 — this repo
bun install
cp .env.example .env   # if needed
bun dev
```

Open http://localhost:5173

## Routes

| Route | Description |
|-------|-------------|
| `/login`, `/register` | Hub JWT auth |
| `/orgs` | List and create organizations |
| `/orgs/:orgId` | X connections (list, revoke, auth token) |
| `/orgs/:orgId/invites` | Create/list/revoke invites (admin) |
| `/orgs/:orgId/settings` | Prompts and members (admin) |
| `/connect/:token` | Public invite → Connect with X |
| `/oauth/success` | Post-OAuth confirmation (Hub redirect target) |

## Production build

```bash
bun run build
```

Set `PUBLIC_HUB_API_URL` and `PUBLIC_HUB_PUBLIC_BASE_URL` at build time for static deploys. Hub enables CORS, so you can set `PUBLIC_HUB_API_URL` to your Hub URL on Vercel (no `/api` rewrite required).

## Deploy on Vercel

1. **Root directory:** `x-executor-frontend` (if the Git repo is the parent monorepo folder).
2. **Framework preset:** Other (or leave auto; [`vercel.json`](vercel.json) sets `framework: null`).
3. **Environment variables** (Production, applied at build time):

   | Variable | Example |
   |----------|---------|
   | `PUBLIC_HUB_API_URL` | `https://your-hub.example.com` |
   | `PUBLIC_HUB_PUBLIC_BASE_URL` | `https://your-hub.example.com` |

4. **Hub** (separate deploy): `OAUTH_SUCCESS_REDIRECT_URL=https://your-app.vercel.app/oauth/success`

[`vercel.json`](vercel.json) runs `bun install --frozen-lockfile` and `bun run build`, output `dist/`. Commit `bun.lock` and `.bun-version`.

If install still fails, in Vercel → Project → Settings → General → **Node.js Version** use **22.x**, and ensure **Install Command** is not overridden to `npm install`. Optional override:

```bash
corepack enable && bun install --frozen-lockfile
```

## Troubleshooting X connect

**“I’m already logged into X but it still asks me to connect”** — Normal. Being signed in at x.com is not the same as authorizing this app. The user must open the invite link, tap **Authorize with X**, and approve on X’s screen. Success ends on `/oauth/success` with `@username` shown.

**X OAuth 400 / “not working”** — Usually Hub `X_REDIRECT_URI` is wrong. It must be a full URL, e.g. `https://your-hub.up.railway.app/api/v1/oauth/x/callback`, registered identically in the X Developer Portal. A broken value looks like `https:///api/v1/oauth/x/callback` (missing hostname).

| Check | Where |
|-------|--------|
| `X_REDIRECT_URI` | Hub env + X Developer Portal callback |
| `HUB_PUBLIC_BASE_URL` | Hub env (full Hub URL) |
| `PUBLIC_HUB_PUBLIC_BASE_URL` | Vercel env (same Hub URL, set at build time) |
| `OAUTH_SUCCESS_REDIRECT_URL` | Hub env → `https://your-app.vercel.app/oauth/success` |

After Hub env changes, redeploy Hub and create a **new invite** if the old one expired or hit max uses.

**Stuck on `/connect` or `/login` after signing in**

| Symptom | Likely cause |
|---------|----------------|
| Login form works but returns to `/login` | `PUBLIC_HUB_API_URL` not set on Vercel (rebuild after adding env) |
| X authorize succeeds but `/connect` again | `OAUTH_SUCCESS_REDIRECT_URL` wrong — must be `https://<vercel>/oauth/success`, not `/connect` or `/login` |
| Hub JSON page after X | `OAUTH_SUCCESS_REDIRECT_URL` unset on Hub |
| Connect shows “max uses” after one success | Normal — use a new invite or confirm connection in admin dashboard |

## Local end-to-end checklist

1. Start Hub on port **3000** with `OAUTH_SUCCESS_REDIRECT_URL=http://localhost:5173/oauth/success`.
2. Start frontend on **5173** (`bun dev`).
3. Register → create org → create invite.
4. Open `/connect/<inviteToken>` → Connect with X → land on `/oauth/success`.
5. In admin UI, verify the new `@username` under Connections; test prompts, members, invite revoke.

## Tests

```bash
bun test
```
