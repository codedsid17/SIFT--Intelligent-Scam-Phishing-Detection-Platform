# SIFT — Scam & Phishing Detection Platform

**Tagline:** *Think twice. Click once.*

SIFT is a privacy-first, 100% browser-local cybersecurity web application that helps users evaluate suspicious SMS alerts, emails, chat messages, and URLs before clicking or replying.

It operates **completely independently** without any external AI models, LLMs, API keys, cloud inference servers, or backend data transmission.

---

## Core Capabilities

- **Rule-Based Message Scanner**: Evaluates text across 18+ weighted rule families covering bank impersonation, OTP harvesting, urgent account verification, delivery smishing, fake job offers, lottery scams, investment fraud, tech-support remote-access lures, and social engineering pressure tactics.
- **Passive URL Scanner & Dissector**: Inspects URL syntax without ever opening or fetching the destination. Detects raw IP hosts, unencrypted HTTP, URL shorteners, Punycode (`xn--`) homographs, brand-in-subdomain spoofing, lookalike domains, `@` credential-masking syntax, and high-abuse TLDs.
- **Contextual False-Positive Guard**: Recognizes legitimate anti-sharing security notices (e.g., *"Chase will never call or text asking for this code. Do not share it."*) and benign isolated mentions of banking or payment terms to minimize false alarms.
- **Explainable Risk Scoring (0–100)**:
  - **0–29**: Low Risk
  - **30–59**: Suspicious
  - **60–100**: High Risk
  - Every result displays triggered indicators, point weights, interactive highlighted spans, and tailored safety recommendations alongside an explicit automated-assessment disclaimer.
- **Dashboard & Local History**: Live analytics charts computed from `localStorage` (`sift_scan_history_v1`), searchable and filterable scan history, individual deletion, and one-click full erasure.
- **Educational Safety Center**: Interactive URL anatomy guide and playbooks for 8 common scam categories.

---

## Privacy Architecture

- **Zero External Requests**: All scanning executes synchronously in browser memory using deterministic TypeScript/JavaScript heuristics.
- **Local-Only Persistence**: Scan history is stored exclusively in browser `localStorage`.
- **Safe URL Handling**: Submitted URLs are never visited, prefetched, or rendered as clickable outbound links.

---

## Project Structure

```text
src/
├── assets/images/            # Generated static visual assets
├── components/
│   ├── DashboardView.tsx     # Local KPIs, live SVG charts, quick scanner
│   ├── HistoryView.tsx       # Search, filters, individual delete & clear-all
│   ├── LandingView.tsx       # Overview, workflow, capabilities, privacy
│   ├── ResultsView.tsx       # Risk gauge, interactive highlights, URL anatomy
│   ├── RiskVisuals.tsx       # Animated SVG circular gauge & status indicators
│   ├── SafetyCenterView.tsx  # Scam playbooks & URL anatomy guide
│   ├── ScannerView.tsx       # Message/URL tabs, validation, sample selector
│   └── TopNav.tsx            # Responsive 3-zone top navigation
├── data/
│   ├── safetyGuides.ts       # Educational scam guides & safety principles
│   └── samples.ts            # Realistic test messages & URLs
├── engine/
│   ├── detectionEngine.ts    # Public analyzeMessage / analyzeUrl / validation API
│   ├── messageAnalyzer.ts    # Lexical, pattern, contextual & span highlighting
│   ├── recommendations.ts    # Threat-tailored actionable next steps
│   ├── types.ts              # Detection engine TypeScript definitions
│   └── urlAnalyzer.ts        # Passive URL parser, extractor & heuristic rules
├── storage/
│   └── historyStorage.ts     # localStorage read/append/delete/clear helpers
└── tests/
    └── detectionEngine.test.ts # Automated test suite (10 test cases)
```

---

## Installation & Usage

```bash
# 1. Install dependencies
npm install

# 2. Start the development server (runs on http://localhost:3000)
npm run dev

# 3. Run the automated detection engine test suite
npm test

# 4. Typecheck and build for production
npm run lint
npm run build
```
