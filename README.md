# History Globe

A fully static web app: rotate a 3D globe and move a time slider (100,000 BCE → today) to see the main events of human history. No backend.

- **Globe:** [globe.gl](https://globe.gl). Colors = category, marker size = importance (Wikipedia sitelink count).
- **Data:** a build-time script queries Wikidata (events from a class allowlist, located via P625 → P276 → P131 → P17, with an English Wikipedia article) and writes static JSON per time bucket to `public/data/`. Top 100 per bucket, at most 25 per continent (unused slots go proportionally to continents with more events). Summaries and images are fetched live from the Wikipedia REST API when an event is opened.
- **Migrations:** `src/migrations.ts` holds ~35 hand-curated migrations (Out of Africa, peopling of Australia and the Americas, Neolithic farmers, Indo-European, Bantu, Austronesian/Polynesian, Migration Period, Vikings, …) drawn as animated arcs while their date range overlaps the slider. Wikidata has almost no dates or routes for these, so dates and routes are approximate; add more by extending that file.
- **Slider scale:** millennia to 4000 BCE, 500 y to 2000 BCE, centuries to 200 BCE, 50 y to 1000 CE, decades to 1900, then single years. Events spanning more than 50 years are shown by start year only.

## Commands

| | |
|---|---|
| `npm run dev` | dev server |
| `npm run build:data` | refresh `public/data` from Wikidata (slow, cached in `scripts/.cache`) |
| `npm test` | unit tests (Vitest) |
| `npm run e2e` | Playwright smoke test (`npx playwright install chromium` first) |
| `npm run build` | production build in `dist/` |

Deployment: push to `main`; `.github/workflows/deploy.yml` publishes to GitHub Pages (enable Pages → "GitHub Actions" in repo settings).

## Attribution

Event text and images come from Wikipedia (CC BY-SA); structured data from Wikidata (CC0). Earth textures from [three-globe](https://github.com/vasturiano/three-globe) examples (MIT). UI strings live in `src/i18n.ts` for future translations.
