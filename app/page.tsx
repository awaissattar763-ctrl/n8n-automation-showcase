"use client";

import { useRef, useState } from "react";
import WorkflowCanvas, {
  NodeStatus,
  RunLogEntry,
  logLine,
} from "../components/WorkflowCanvas";
import {
  BUDGET_LABELS,
  LeadInput,
  SERVICE_LABELS,
  scoreLead,
  tierBadge,
} from "../lib/scoring";

const EMPTY: LeadInput = {
  name: "",
  email: "",
  service: "ai-automation",
  budget: "2000-10000",
  message: "",
};

const PRESETS: { label: string; data: LeadInput }[] = [
  {
    label: "🔥 Hot lead",
    data: {
      name: "Sarah Mitchell",
      email: "sarah@mitchellroofing.com",
      service: "ai-automation",
      budget: "2000-10000",
      message:
        "We miss calls every evening and lose jobs to competitors. Need an AI system that answers and books estimates. Please call me asap — hoping to decide this week.",
    },
  },
  {
    label: "🟡 Warm lead",
    data: {
      name: "Tom Becker",
      email: "tom.becker92@gmail.com",
      service: "website",
      budget: "500-2000",
      message: "Thinking about redoing our website sometime next quarter.",
    },
  },
  {
    label: "🔵 Cold / spam",
    data: {
      name: "SEO Blast",
      email: "promo@seoblast.example",
      service: "fix",
      budget: "under-500",
      message: "We offer seo services guaranteed #1 first page of google rank #1!",
    },
  },
];

const NODE_LABELS = [
  "Lead Intake Webhook",
  "Score Lead",
  "Supabase — Insert Lead",
  "Day 0 — Confirmation Email",
  "Wait 1 Day",
  "Day 1 — Follow-up Email",
  "Wait 2 Days",
  "Day 3 — Call Task",
  "Is Hot Lead?",
  "Slack — Hot Lead Alert",
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface ScoreView {
  score: number;
  tier: "hot" | "warm" | "cold";
  reasons: string[];
  spamFlag: boolean;
  name: string;
  email: string;
  service: string;
  budget: string;
}

export default function Home() {
  const [form, setForm] = useState<LeadInput>(EMPTY);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [statuses, setStatuses] = useState<NodeStatus[]>(
    Array(10).fill("idle") as NodeStatus[]
  );
  const [log, setLog] = useState<RunLogEntry[]>([]);
  const [result, setResult] = useState<ScoreView | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const runId = useRef(0);

  const set = (patch: Partial<LeadInput>) =>
    setForm((f) => ({ ...f, ...patch }));

  async function runWorkflow(input: LeadInput) {
    const id = ++runId.current;
    const alive = () => runId.current === id;

    setPhase("running");
    setResult(null);
    setSelected(null);
    setStatuses(Array(10).fill("idle") as NodeStatus[]);

    const entries: RunLogEntry[] = [];
    const push = (node: string, message: string) => {
      const e = logLine(node, message);
      entries.push(e);
      if (alive()) setLog([...entries]);
    };
    const setNode = (i: number, s: NodeStatus) => {
      if (!alive()) return;
      setStatuses((prev) => {
        const n = [...prev];
        n[i] = s;
        return n;
      });
    };
    const runNode = async (i: number, ms: number) => {
      setNode(i, "running");
      await sleep(ms);
      if (!alive()) return false;
      setNode(i, "done");
      return true;
    };

    const scored = scoreLead(input);

    // 0 — Webhook
    setNode(0, "running");
    push(
      NODE_LABELS[0],
      `POST /lead-intake — form submitted by “${input.name || "visitor"}”`
    );
    if (!(await runNode(0, 950))) return;
    push(NODE_LABELS[0], "200 OK — payload validated");

    // 1 — Score Lead
    setNode(1, "running");
    push(NODE_LABELS[1], "Code node: running transparent scoring rules…");
    await sleep(1100);
    if (!alive()) return;
    push(
      NODE_LABELS[1],
      `Score ${scored.score}/100 → ${scored.tier.toUpperCase()} (${
        scored.reasons.length - 1
      } signals evaluated)`
    );
    setNode(1, "done");

    // 2 — Supabase insert
    setNode(2, "running");
    push(NODE_LABELS[2], "POST → Supabase “leads” table (score, tier, reasons)…");
    if (!(await runNode(2, 900))) return;
    push(NODE_LABELS[2], "Row inserted — lead stored with full run history");

    // 3 — Day 0 email
    setNode(3, "running");
    push(NODE_LABELS[3], `Sending confirmation email → ${input.email || "visitor"}…`);
    if (!(await runNode(3, 900))) return;
    push(NODE_LABELS[3], "Email sent — “Thanks, we got your request.”");

    // 4 — Wait 1 day (compressed in simulation)
    setNode(4, "running");
    push(
      NODE_LABELS[4],
      "⏳ Real workflow pauses here for 1 day — compressed to 1s in this simulation"
    );
    if (!(await runNode(4, 1000))) return;

    // 5 — Day 1 email
    setNode(5, "running");
    push(NODE_LABELS[5], "Sending Day-1 follow-up email…");
    if (!(await runNode(5, 900))) return;
    push(NODE_LABELS[5], "Follow-up sent — nobody had to remember");

    // 6 — Wait 2 days (compressed)
    setNode(6, "running");
    push(
      NODE_LABELS[6],
      "⏳ Real workflow pauses here for 2 days — compressed to 1s in this simulation"
    );
    if (!(await runNode(6, 1000))) return;

    // 7 — Day 3 call task
    setNode(7, "running");
    push(NODE_LABELS[7], "Creating call task for the owner…");
    if (!(await runNode(7, 900))) return;
    push(NODE_LABELS[7], "Call task created — hot leads get called, not just emailed");

    // 8 — Is Hot Lead? (router)
    setNode(8, "running");
    push(NODE_LABELS[8], `Evaluating: score ${scored.score} ≥ 75?`);
    await sleep(800);
    if (!alive()) return;
    if (scored.tier === "hot") {
      push(NODE_LABELS[8], "TRUE — taking the hot-lead branch");
      setNode(8, "done");

      // 9 — Slack alert
      setNode(9, "running");
      push(NODE_LABELS[9], "Posting hot-lead card to #new-leads…");
      await sleep(1000);
      if (!alive()) return;
      push(NODE_LABELS[9], "Alert delivered — owner notified in seconds");
      setNode(9, "done");
    } else {
      push(
        NODE_LABELS[8],
        `FALSE — score ${scored.score} below the 75 hot-lead threshold`
      );
      setNode(8, "done");
      setNode(9, "skipped");
      push(
        NODE_LABELS[9],
        "Skipped — only hot leads trigger the owner alert"
      );
    }

    if (alive()) {
      setResult({
        score: scored.score,
        tier: scored.tier,
        reasons: scored.reasons,
        spamFlag: scored.spamFlag,
        name: input.name,
        email: input.email,
        service: input.service,
        budget: input.budget,
      });
      setPhase("done");
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase === "running") return;
    runWorkflow({ ...form });
  };

  const badge = result ? tierBadge(result.tier) : null;

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-lg">
              🔗
            </span>
            <span className="font-semibold tracking-tight">
              n8n Automation <span className="text-zinc-500">Showcase</span>
            </span>
          </div>
          <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-amber-300">
            CONCEPT DEMO — SIMULATED
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-14 text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Watch a real n8n workflow{" "}
          <span className="text-emerald-400">run your lead pipeline</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
          Imagine this quote form on the website of Maple &amp; Pine Dental
          Studio — a fictional sample business. Submit a lead and watch the
          actual 10-node n8n workflow execute step by step: capture, score,
          save, follow up, and alert on hot leads.
        </p>
        <p className="mt-3 text-xs text-zinc-600">
          The on-page animation is simulated in your browser. The downloadable{" "}
          <span className="font-mono">workflow.json</span> below is a genuine,
          import-ready n8n workflow — no live services are connected here.
        </p>
      </section>

      {/* Form + score */}
      <section className="mx-auto max-w-6xl px-5 pb-10">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Sample website form</h2>
              <span className="text-[11px] uppercase tracking-widest text-zinc-600">
                “Request a quote”
              </span>
            </div>
            <p className="mb-4 text-sm text-zinc-500">
              This stands in for the contact form on a business website. In the
              real workflow, n8n receives it via the Lead Intake Webhook.
            </p>

            <div className="mb-4 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => set(p.data)}
                  disabled={phase === "running"}
                  className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300 transition hover:border-emerald-500/60 hover:text-emerald-300 disabled:opacity-40"
                >
                  Fill: {p.label}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-zinc-400">
                    Name
                  </span>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => set({ name: e.target.value })}
                    placeholder="Jane Cooper"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none placeholder:text-zinc-600 focus:border-emerald-500/60"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-zinc-400">
                    Email
                  </span>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => set({ email: e.target.value })}
                    placeholder="jane@company.com"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none placeholder:text-zinc-600 focus:border-emerald-500/60"
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-zinc-400">
                    Service needed
                  </span>
                  <select
                    value={form.service}
                    onChange={(e) => set({ service: e.target.value })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500/60"
                  >
                    {Object.entries(SERVICE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-zinc-400">
                    Budget range
                  </span>
                  <select
                    value={form.budget}
                    onChange={(e) => set({ budget: e.target.value })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500/60"
                  >
                    {Object.entries(BUDGET_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-zinc-400">
                  Project details &amp; timeline
                </span>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => set({ message: e.target.value })}
                  placeholder="What do you need, and when? e.g. “We need this asap — launching next month.”"
                  className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none placeholder:text-zinc-600 focus:border-emerald-500/60"
                />
              </label>
              <button
                type="submit"
                disabled={phase === "running"}
                className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-60"
              >
                {phase === "running" ? "Workflow running…" : "Run the workflow →"}
              </button>
            </form>
          </div>

          {/* Score result */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="mb-1 text-lg font-semibold">Score Lead output</h2>
            <p className="mb-4 text-sm text-zinc-500">
              What the Code node returns for this lead — same rules as the real
              workflow.
            </p>
            {!result && (
              <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-zinc-800 text-center text-sm text-zinc-600">
                Run the workflow to see the scoring output here.
              </div>
            )}
            {result && badge && (
              <div className="msg-in">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
                    Lead score
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${badge.classes}`}
                  >
                    {badge.label}
                  </span>
                </div>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-6xl font-bold tracking-tight text-emerald-300">
                    {result.score}
                  </span>
                  <span className="pb-2 text-zinc-500">/ 100</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-1000"
                    style={{ width: `${result.score}%` }}
                  />
                </div>
                <p className="mt-4 text-sm font-medium text-zinc-300">
                  {result.name} · {result.email}
                </p>
                <p className="text-xs text-zinc-500">
                  {SERVICE_LABELS[result.service]} · {BUDGET_LABELS[result.budget]}
                </p>
                {result.spamFlag && (
                  <p className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                    ⚠️ Flagged as possible spam — held for manual review, no
                    aggressive follow-up scheduled.
                  </p>
                )}
                <div className="mt-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                    Why this score
                  </p>
                  <ul className="space-y-1.5 text-xs text-zinc-400">
                    {result.reasons.map((r, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-emerald-400">›</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Workflow canvas */}
      <section className="mx-auto max-w-6xl px-5 pb-14">
        <WorkflowCanvas
          statuses={statuses}
          log={log}
          selected={selected}
          onSelect={setSelected}
        />
        <p className="mt-4 text-center text-xs text-zinc-600">
          Node names, order and n8n types match the downloadable{" "}
          <span className="font-mono">workflow.json</span> exactly (21 nodes
          total incl. setup notes — 10 execute in a run).
        </p>
      </section>

      {/* Scoring transparency */}
      <section className="border-t border-zinc-800/80 bg-zinc-900/20">
        <div className="mx-auto max-w-4xl px-5 py-14">
          <h2 className="text-center text-2xl font-bold tracking-tight">
            The exact scoring rules — no black box
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-zinc-500">
            These are the rules inside the “Score Lead” Code node of the real
            workflow. The demo above runs the identical logic.
          </p>
          <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60 text-left text-[11px] uppercase tracking-widest text-zinc-500">
                  <th className="px-5 py-3">Signal</th>
                  <th className="px-5 py-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {[
                  ["Base — every genuine inquiry starts here", "+10"],
                  ["Budget: Under $500 / $500–$2k / $2k–$10k / $10k+", "+5 / +20 / +35 / +45"],
                  ["Service: AI automation / website / booking / CRM / fix", "+20 / +15 / +15 / +12 / +8"],
                  ["Urgency keywords (asap, urgent, this week…)", "+10"],
                  ["Timeline words (deadline, launch, go live…)", "+5"],
                  ["Business email domain (not gmail/yahoo/…)", "+10"],
                  ["Spam patterns (SEO services, crypto, rank #1…)", "−30"],
                ].map(([signal, pts]) => (
                  <tr key={signal}>
                    <td className="px-5 py-3">{signal}</td>
                    <td className="px-5 py-3 text-right font-mono text-emerald-300">
                      {pts}
                    </td>
                  </tr>
                ))}
                <tr className="bg-zinc-900/40">
                  <td className="px-5 py-3 font-medium">
                    Tier: ≥ 75 hot · ≥ 45 warm · below 45 cold
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-zinc-400">
                    0–100
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Use it yourself */}
      <section className="mx-auto max-w-4xl px-5 py-14">
        <h2 className="text-center text-2xl font-bold tracking-tight">
          Use it yourself — the real workflow
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-zinc-500">
          The animation above is a simulation. This file is the genuine article:
          a complete n8n workflow, ready to import.
        </p>
        <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-3xl">
              📦
            </span>
            <div>
              <p className="font-mono text-sm font-semibold text-zinc-100">
                workflow.json
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                21 nodes · webhook → scoring → Supabase → emails → waits → call
                task → hot-lead router → Slack alert
              </p>
            </div>
            <a
              href="workflow.json"
              download="n8n-lead-pipeline-workflow.json"
              className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
            >
              ⬇ Download the n8n workflow
            </a>
          </div>
          <div className="mx-auto mt-8 max-w-2xl">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
              Import into your n8n
            </p>
            <ol className="space-y-3 text-sm text-zinc-400">
              {[
                ["1", "In n8n: Workflows → ⋯ menu → Import from File — select the downloaded workflow.json."],
                ["2", "Connect your credentials: Supabase (Postgres) for the leads table, SMTP for the emails, and your Slack incoming-webhook URL for the hot-lead alert."],
                ["3", "The “Score Lead” Code node needs no changes — it already runs the scoring rules shown above."],
                ["4", "Activate the workflow and point your website form at the Lead Intake Webhook URL. New submissions now run the full pipeline automatically."],
              ].map(([n, text]) => (
                <li key={n} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-bold text-emerald-300">
                    {n}
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-zinc-600">
          Concept demo — not a client project. No client names, testimonials or
          results are claimed anywhere on this page.
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80">
        <div className="mx-auto max-w-6xl px-5 py-6 text-center text-xs text-zinc-600">
          <p>
            n8n Automation Showcase — concept demo. On-page animation simulated;
            downloadable workflow.json is a real n8n workflow.
          </p>
        </div>
      </footer>
    </div>
  );
}
