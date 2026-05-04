# CardWise

An independent, affiliate-free Canadian credit card finder.

CardWise pairs Canadians with the right credit card via a 5-question quiz that scores 50+ Canadian cards across cashback, travel rewards, low-interest, no-fee, credit-building, and student categories.

## Stack

- Pure HTML / CSS / vanilla JavaScript
- No build step, no framework, no backend
- Runs entirely in the browser — no data leaves your device

## Local development

Open `index.html` in any modern browser, or serve the folder with any static server:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Marketing landing page + 5-step wizard + results section |
| `styles.css` | Editorial light/dark theme with glassmorphism |
| `app.js` | Wizard state machine, scoring engine, results renderer |
| `data.js` | Canadian credit card database (50+ cards) |
| `favicon.svg` | Site icon |

## Scoring engine

Each card earns up to 100 points:

- **40** — goal alignment (cashback / travel / low_interest / no_fee / build_credit / student)
- **25** — overlap with your top spending categories
- **15** — annual fee fit
- **15** — credit eligibility (cards you can't qualify for are penalized)
- **5** — spend-to-fee value

## Disclaimer

CardWise provides general suggestions based on publicly available card information. Card terms, rates, fees, and offers change frequently — always verify on the issuer's official site before applying. This is not financial advice.

Original prototype lives at [paawan99.github.io](https://paawan99.github.io/credit-card-finder.html). This is the standalone, redesigned version.
