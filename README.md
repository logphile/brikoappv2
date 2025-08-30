# BrickMOC Companion

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
