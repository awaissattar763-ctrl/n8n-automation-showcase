// Animated canvas that mirrors the real n8n workflow's executable nodes.
// The animation is a simulation; node names, order and n8n types match
// public/workflow.json exactly.

export type NodeStatus = "idle" | "running" | "done" | "skipped";

export interface WorkflowNodeDef {
  id: string;
  name: string;
  n8nType: string;
  icon: string;
  blurb: string;
}

export const WORKFLOW_NODES: WorkflowNodeDef[] = [
  {
    id: "webhook",
    name: "Lead Intake Webhook",
    n8nType: "n8n-nodes-base.webhook",
    icon: "🛰️",
    blurb:
      "Listens for the website form. Every submission starts a run instantly — no polling, no missed inquiries.",
  },
  {
    id: "score",
    name: "Score Lead",
    n8nType: "n8n-nodes-base.code",
    icon: "</>",
    blurb:
      "A Code node runs the transparent scoring rules (0–100) on budget, service, urgency keywords and email domain.",
  },
  {
    id: "supabase",
    name: "Supabase — Insert Lead",
    n8nType: "n8n-nodes-base.httpRequest",
    icon: "🗄️",
    blurb:
      "Saves the scored lead — name, email, score, tier and reasons — to the leads table.",
  },
  {
    id: "email0",
    name: "Day 0 — Confirmation Email",
    n8nType: "n8n-nodes-base.emailSend",
    icon: "✉️",
    blurb:
      "Instant confirmation email to the visitor: “Thanks, we got your request.”",
  },
  {
    id: "wait1",
    name: "Wait 1 Day",
    n8nType: "n8n-nodes-base.wait",
    icon: "⏳",
    blurb: "Pauses this run for exactly 1 day before the next follow-up.",
  },
  {
    id: "email1",
    name: "Day 1 — Follow-up Email",
    n8nType: "n8n-nodes-base.emailSend",
    icon: "✉️",
    blurb: "Automatic Day-1 follow-up email — no one has to remember to send it.",
  },
  {
    id: "wait2",
    name: "Wait 2 Days",
    n8nType: "n8n-nodes-base.wait",
    icon: "⏳",
    blurb: "Pauses 2 more days before the call task.",
  },
  {
    id: "calltask",
    name: "Day 3 — Call Task",
    n8nType: "n8n-nodes-base.httpRequest",
    icon: "📞",
    blurb:
      "Creates a call task for the owner in the CRM — hot leads get called, not just emailed.",
  },
  {
    id: "ishot",
    name: "Is Hot Lead?",
    n8nType: "n8n-nodes-base.if",
    icon: "🔀",
    blurb:
      "The router. Score ≥ 75 takes the hot-lead branch; everything else skips the alert.",
  },
  {
    id: "slack",
    name: "Slack — Hot Lead Alert",
    n8nType: "n8n-nodes-base.httpRequest",
    icon: "⚡",
    blurb:
      "Posts a hot-lead card to #new-leads so the owner can call within minutes — while the lead is still hot.",
  },
];

export interface RunLogEntry {
  time: string;
  node: string;
  message: string;
}

export function logLine(node: string, message: string): RunLogEntry {
  const t = new Date();
  const time = t.toTimeString().slice(0, 8);
  return { time, node, message };
}

function statusStyles(s: NodeStatus): string {
  switch (s) {
    case "running":
      return "border-emerald-400/70 bg-emerald-400/10 node-running";
    case "done":
      return "border-emerald-500/40 bg-emerald-500/5";
    case "skipped":
      return "border-zinc-800 bg-zinc-900/30 opacity-50";
    default:
      return "border-zinc-800 bg-zinc-900/40";
  }
}

export default function WorkflowCanvas({
  statuses,
  log,
  selected,
  onSelect,
}: {
  statuses: NodeStatus[];
  log: RunLogEntry[];
  selected: number | null;
  onSelect: (i: number | null) => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Node flow */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
            Workflow execution
          </h2>
          <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
            10 nodes · simulated run
          </span>
        </div>
        <div>
          {WORKFLOW_NODES.map((node, i) => {
            const st = statuses[i];
            const isSel = selected === i;
            return (
              <div key={node.id}>
                <button
                  type="button"
                  onClick={() => onSelect(isSel ? null : i)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${statusStyles(
                    st
                  )} ${isSel ? "ring-1 ring-cyan-400/60" : ""}`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-base">
                    {st === "done" ? (
                      <span className="text-emerald-400">✓</span>
                    ) : st === "skipped" ? (
                      <span className="text-zinc-600">–</span>
                    ) : st === "running" ? (
                      <span className="flex gap-0.5">
                        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      </span>
                    ) : (
                      node.icon
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-zinc-100">
                      {node.name}
                    </span>
                    <span className="block truncate font-mono text-[10px] text-zinc-500">
                      {node.n8nType}
                    </span>
                  </span>
                  {st === "skipped" && (
                    <span className="shrink-0 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">
                      skipped
                    </span>
                  )}
                </button>
                {i < WORKFLOW_NODES.length - 1 && (
                  <div className="relative mx-auto h-5 w-px bg-zinc-800">
                    {st === "done" && statuses[i + 1] === "running" && (
                      <span className="flow-pulse absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-emerald-400" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Log + node detail */}
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-zinc-400">
            Run log
          </h2>
          <div className="log-scroll max-h-64 space-y-1.5 overflow-y-auto font-mono text-[11px] leading-relaxed">
            {log.length === 0 && (
              <p className="text-zinc-600">
                // Submit a sample lead to watch the workflow execute…
              </p>
            )}
            {log.map((e, i) => (
              <p key={i} className="msg-in">
                <span className="text-zinc-600">[{e.time}]</span>{" "}
                <span className="text-cyan-300">{e.node}</span>{" "}
                <span className="text-zinc-400">{e.message}</span>
              </p>
            ))}
          </div>
        </div>

        <div className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-zinc-400">
            Node detail
          </h2>
          {selected === null ? (
            <p className="text-sm text-zinc-500">
              Click any node to see what it does. Node names and order match the
              real n8n workflow you can download below.
            </p>
          ) : (
            <div className="msg-in">
              <p className="text-sm font-semibold text-zinc-100">
                {WORKFLOW_NODES[selected].icon} {WORKFLOW_NODES[selected].name}
              </p>
              <p className="mt-1 font-mono text-[11px] text-zinc-500">
                {WORKFLOW_NODES[selected].n8nType}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {WORKFLOW_NODES[selected].blurb}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
