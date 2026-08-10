# vault-ui

A lean, graph-forward Next.js UI over the vault-core API. Four screens, no bloat:

- **Digest** (`/`) — the latest ingestion run: stat tiles, the day's papers, health.
- **Explore** (`/explore`) — the hero: an interactive force-graph of concept
  **co-occurrence** (nodes = concepts sized by mentions, links = shared papers).
  Click a concept → its papers + closest neighbours (`/concepts/<id>`).
- **Paper detail** (`/papers/<id>`) — the full structured AI summary (tl;dr,
  highlights, method, evals, takeaways, open questions) + concept chips.
- **Curate** (`/curate`) — the control plane: approve concepts ingestion proposes
  and edit the interest profile. Config is graph data, edited at runtime.

## Design

Reuses vault-v1's dark "intelligence-briefing" theme and shadcn/Base-UI
primitives; the filesystem data layer is replaced by `lib/api.ts` (a typed,
server-side client to vault-core). All reads happen in server components — the
browser never calls vault-core directly, so there's no CORS. Mutations
(approve, save profile) go through thin Next route handlers in `app/api/*` that
proxy to vault-core.

## Run it

Requires **vault-core** running (Neo4j + API — see `../vault-core/README.md`):

```bash
cd ../vault-core && docker-compose up -d neo4j && ./vc serve   # API on :8000
```

Then:

```bash
npm install
cp .env.example .env.local     # optional; API_BASE defaults to http://localhost:8000
npm run dev                    # http://localhost:3000
```

For a fast, stable local check, `npm run build && npm run start` (production
server) avoids Turbopack's slow per-route dev compile.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind v4 · shadcn on
`@base-ui/react` · `react-force-graph-2d` (dynamic import, `ssr:false`).
