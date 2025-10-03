# Briko

Turn any idea or image into a LEGO-style build preview with a parts list, cost estimate, and quick exports.

## Tech Stack
Nuxt 3, TypeScript, Tailwind, Pinia, Supabase, Three.js, Web Workers, jsPDF. Hosted on Azure Static Web Apps.

## Quick Start
```bash
# install deps
npm i

# env (only if using Supabase)
cp .env.example .env
# add NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_ANON_KEY

# dev
npm run dev
```

## Project Structure

- `public/data/*` starter palettes & price heuristics
- `app/workers/*` heavy tasks (mosaic, voxels, pdf)
- `app/utils/*` color mapping, tilers, exporters
- `app/pages/studio.vue` main builder UI

## MVP Roadmap (Month 1)

- Mosaic engine + CSV/PNG export
- Voxel preview + layered PDF export
- Auth/saves/sharing + avatar mode
- Perf polish + analytics + marketing pages

## Legal

Not affiliated with the LEGO Group. “LEGO” is a trademark of the LEGO Group, which does not sponsor or endorse this project.

---

## Setup steps (copy/paste)

1) Create repo & install
```bash
npm create nuxt@latest brickmoc
cd brickmoc
npm i
```

2) Add Tailwind
```bash
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

3) Replace configs with the ones in this repo; add `app/assets/styles/globals.css`.

4) Drop starter data

Put `lego_colors.json`, `parts_palette.json`, `avg_prices.json` into `public/data/`.

5) Scaffold pages/components/workers using the stubs in this repo.

6) Run dev
```bash
npm run dev
```

## Azure Static Web Apps

- Connect your GitHub repo to an Azure Static Web App resource.
- The GitHub Action `.github/workflows/azure-static-web-apps.yml` builds with `npm run build` and uploads `.output/public`.
- Static routing config is in `staticwebapp.config.json` with SPA fallback and `/health` excluded.
- Add repo secret `AZURE_STATIC_WEB_APPS_API_TOKEN` from your Azure SWA resource.

## Windsurf-ready task list (first commits)

- Add Tailwind tokens + global layout (brand colors).
- Implement `app/composables/usePalette.ts` loader + nearest-color (ΔE later).
- Wire `app/workers/mosaic.worker.ts` with:
  - map pixels → palette
  - optional Floyd–Steinberg
  - greedy tiler (1×4→1×2→1×1)
  - return BOM + est price (from `public/data/avg_prices.json`)
- Build `/studio` three-panel UI; hook up worker; show live stats.
- Add `exportCsv` + `exportPng`.

## Seeding the Community Gallery

To populate `/gallery` with sample public projects for demos/dev:

1) Put a few small images in `public/samples/gallery/` (supports `.png`, `.jpg`, `.jpeg`).

2) Create a root `.env.local` (do not commit) with:

```bash
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```


Important:
- The service role key must be the “service_role” from Supabase → Settings → API. It is a JWT-looking string containing two dots (`header.payload.signature`).
- Never commit the service role key and never place it under `public/`.
- If a service key is ever exposed, rotate it immediately in the Supabase Dashboard and update your local `.env.local`.

3) Run the seeder:

```bash
npm install
npm run seed:gallery
```

This script will:
- Ensure the `projects` storage bucket exists and is public.
- Create or reuse 8 fake users via the Admin API.
- Insert public rows in `user_projects` and upload previews to `projects/{userId}/{projectId}/preview.png`.

Cleanup (optional, run as project owner):

```sql
delete from public.user_projects
where user_id in (
  select id from auth.users where raw_user_meta_data->>'seed' = 'true'
);
