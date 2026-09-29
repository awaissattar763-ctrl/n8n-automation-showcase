# Demo Video Script — n8n Automation Showcase (60 seconds)

**Setup:** open the public demo page (`/`), start screen recording. Click
“Fill: 🔥 Hot lead” so the form is ready. Speak naturally — timings are
approximate.

---

**[0:00–0:08] Hook**

> "Most small businesses have the same leak: a website form gets filled in at
> 9 PM… and nobody follows up for days. This is a real n8n workflow that fixes
> it — and you can watch it run, node by node."

*Action: hero visible, scroll slightly to the form.*

**[0:08–0:18] Submit the lead**

> "I'm the website visitor. I submit a quote request — and the workflow wakes
> up."

*Action: click “Run the workflow →”. Point at the Lead Intake Webhook node
lighting up, then the run log lines appearing.*

**[0:18–0:32] Score + save + follow-ups**

> "First the Score Lead node runs the transparent rules — 95 out of 100, hot —
> and the exact same rules live in the real workflow's Code node. Then it saves
> everything to the CRM, sends the confirmation email, and schedules the Day-1
> and Day-3 follow-ups. The wait nodes pause for real in n8n — compressed here."

*Action: point at nodes 2–8 completing; click the “Score Lead” node to show its
n8n type; scroll to the score card and the “Why this score” list.*

**[0:32–0:45] Hot-lead routing + Slack**

> "Then the router — Is Hot Lead? Score 95, so it takes the hot branch… and the
> owner gets a Slack alert within seconds, while the lead is still thinking
> about them."

*Action: point at the IF node evaluating, then the Slack node completing. Click
the Slack node for its detail.*

**[0:45–0:55] Transparency + real workflow**

> "Every rule is on the table — budget, service, urgency, email domain — no
> black box. And this isn't just a mockup: the actual workflow.json downloads
> right here and imports straight into n8n."

*Action: scroll to the scoring table, then to the download section; hover the
download button.*

**[0:55–1:00] Close**

> "Concept demo on the page — real automation in the download. If missed
> inquiries are costing you jobs, let's talk."

---

**Recording tips**

- Do one full off-camera run first, then reload the page right before
  recording for a clean take.
- The run takes ~10 seconds — don't rush the narration; let each node land.
- For contrast, record a second 15-second clip with the “🔵 Cold / spam”
  preset to show the router skipping the Slack node.
- Keep the browser at ~1280px wide so the form and score card sit side by side.
