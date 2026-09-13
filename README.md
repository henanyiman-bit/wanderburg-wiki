# Wanderburg Field Guide

Astro 7, TypeScript, Tailwind CSS 4, MDX content collections, JSON data. Static output for Cloudflare Pages. All player-facing text is English. No game stats or named entities are invented.

## Run

Node 22.12+ (verified on Node 24). `npm install`, `npm run dev`, `npm run build`, `npm run check`.

## Cloudflare Pages

Connect this repository, use build command `npm run build`, output directory `dist`, and Node 24. Set `PUBLIC_SITE_URL=https://your-real-domain.com` in the build environment. The default is `http://localhost:4321`. No adapter or worker is necessary. A deployment has not been created by this project.

## Content

`src/data/pages.json` owns routes and page metadata; `src/content/guides` owns guide MDX. `src/data/database/*.json` owns each entity exactly once. Entity schema is `Entity` in `src/lib/data.ts`: slug, name, summary, source, updated, stats (values nullable), howToGet (nullable), uses (nullable), related (internal URLs). Populate only verified records. Entity pages, search and sitemap generate from that data. Validate named records before enabling category indexing in pages.json. Keywords live in keywords.json and checks detect intent conflicts.

Empty categories and ranking policies use noindex,follow. They contain editorial inclusion rules, not fabricated records. Popular entity, best-build ranking, media and video blocks stay hidden until supported records exist. Popular-search links are navigation suggestions, not measured traffic statistics. Research sources are recorded in research/sources.md.

## Advertising

Default provider is `none`. All required env keys are in `.env.example`; disabled ads emit no markup, script or reserved space. To enable a unit, paste the exact publisher-issued embed code into the corresponding field in `src/data/adsterra.json`, set its matching public key, and set the provider to `adsterra`. An embed must include the configured key; no network URL is guessed. The default banner slot is 320×50; match dimensions to your approved unit. NativeBanner and SocialBar are reusable optional placements. Popunders are not activated. This edition has no ad network requests. Reference: https://adsterra.com/blog/how-banner-ads-make-money/

## Validation

`npm run check` runs Astro/TypeScript validation and static output checks. Individual checks can run with `node --experimental-strip-types scripts/check-meta.ts` (and equivalent filenames). Build first. Checks cover metadata, intent conflicts, canonical paths, links, orphans, media, empty ads, section density and repeated home modules. Lighthouse targets require browser measurement; the static checks do not claim a Lighthouse score.

## Assets and contact

SVG art/icons are original internal designs, not official game UI or screenshots. No remote images or fonts are used. The contact page honestly states that no public inbox has been configured. Add a real contact address before promoting public submissions.
