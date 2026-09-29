# n8n Automation Showcase — Concept Demo

An animated walkthrough of a **real, import-ready n8n lead-pipeline workflow**
for small businesses (fictional “Maple & Pine Dental Studio”): submit a sample
lead and watch the actual 10 executable nodes run step by step — webhook,
scoring, CRM insert, follow-up emails, waits, call task, hot-lead router, Slack
alert.

**Honest split, stated on the page:**
- **Simulated:** the on-page node animation, run log, emails and Slack alert
  all run in your browser. Nothing is connected to real services.
- **Real:** `public/workflow.json` is a genuine, import-ready n8n workflow
  (21 nodes incl. setup notes). The demo's scoring logic is the exact same
  rules as the workflow's "Score Lead" Code node — verified by reading the
  workflow source.

**No client names, metrics, or testimonials are claimed.** All sample data is
fictional.

## Features

- **Interactive workflow runner:** sample lead form (name, email, service,
  budget, timeline) with 🔥/🟡/🔵 presets → animated node-by-node execution
  with live run log.
- **Clickable nodes:** every node shows its real n8n node type
  (`n8n-nodes-base.webhook`, `.code`, `.httpRequest`, `.emailSend`, `.wait`,
  `.if`) and what it does. Node names/order match `workflow.json` exactly.
- **Scoring transparency panel:** the exact rules/weights from the Code node —
  no black box.
- **"Use it yourself":** one-click download of the real `workflow.json` plus
  4-step n8n import instructions.

## Run locally

```bash
npm install
npm run dev   # http://localhost:3000
```

## Build (static export)

```bash
npm run build   # outputs to out/
```

`next.config.mjs` uses `output: 'export'`, `trailingSlash: true` and
`basePath: '/n8n-automation-showcase'` for GitHub Pages hosting.

## Demo video

See `DEMO-SCRIPT.md` for the 60-second recording script.
