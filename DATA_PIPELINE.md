# Credit Card Finder Data Pipeline

## Current Architecture

The Credit Card Finder no longer stores its card database inside `credit-card-finder.html`.

Runtime data files:

- `data/credit-cards.json` - card recommendation database used by the finder.
- `data/bank-kb-lite.json` - public, lightweight bank and credit-union knowledge base for future chatbot/search features.

Builder:

```powershell
node .\scripts\build-site-data.js
```

Default source knowledge base:

```text
C:\Users\Paawan\OneDrive\Desktop\bank_knowledge_base
```

The builder removes local Windows source paths from public website JSON. It preserves public source file names, issuer URLs, card fields, and bank metadata.

## Recommended Update Flow

Use this path:

```text
Obsidian bank notes -> bank_knowledge_base -> generated website JSON -> GitHub
```

Reason:

- The Desktop knowledge base stays reviewable and source-backed.
- The website only receives validated JSON data.
- The HTML/CSS/design structure is protected from automated data updates.
- If a scraper or source parser breaks, it fails before changing the live page.

Avoid direct scraper-to-GitHub HTML edits. Direct GitHub updates are acceptable only for `data/*.json` after validation passes.

## Chatbot Plan

A safe AI chatbot should not call an LLM API directly from GitHub Pages, because any browser-side API key can be stolen.

Recommended production shape:

```text
Browser chatbot -> small backend/API endpoint -> retrieval over data/*.json -> LLM response with citations
```

For a static-only version, use `data/bank-kb-lite.json` and `data/credit-cards.json` for deterministic search and recommendations without a private API key.

## Guardrails

- Automated jobs may update `data/credit-cards.json` and `data/bank-kb-lite.json`.
- Automated jobs should not edit `credit-card-finder.html`, CSS, or page structure.
- Preserve issuer/source URLs and `generatedAt` metadata.
- Treat card fees, rates, bonuses, and eligibility as volatile. Re-check before publishing major changes.
