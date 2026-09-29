import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "n8n Automation Showcase — Concept Demo",
  description:
    "Concept demo: watch a real, import-ready n8n workflow score website leads, save them to a CRM, schedule follow-ups and alert on hot leads. The on-page animation is simulated; the downloadable workflow.json is a genuine n8n workflow.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100">{children}</body>
    </html>
  );
}
