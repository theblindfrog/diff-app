import type { ComponentType, SVGProps } from "react";
import {
  IconBolt,
  IconCode,
  IconColumns,
  IconLive,
  IconNavigate,
  IconPaste,
  IconTheme,
  IconWord,
} from "./icons";

type Feature = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  body: string;
};

const FEATURES: Feature[] = [
  {
    icon: IconLive,
    title: "Live file watching",
    body: "Open two files and Differ watches them on disk. Save in your editor and the diff updates instantly — with a Freeze toggle to hold a comparison still.",
  },
  {
    icon: IconPaste,
    title: "Paste mode",
    body: "Two editable panes that re-diff as you type. Perfect for quick snippets, JSON, logs, or prose.",
  },
  {
    icon: IconColumns,
    title: "Split or unified",
    body: "Compare side-by-side or stacked, and switch layouts at any time.",
  },
  {
    icon: IconWord,
    title: "Word-level diffs",
    body: "See exactly what changed within a line — not just which lines changed.",
  },
  {
    icon: IconCode,
    title: "Syntax highlighting",
    body: "Auto-detected from the file extension across 24 languages, powered by Shiki — the highlighter behind GitHub.",
  },
  {
    icon: IconNavigate,
    title: "Change navigation",
    body: "Jump between change regions with the toolbar or keyboard (F8 / ⌥↓), with a running +adds / −dels summary.",
  },
  {
    icon: IconBolt,
    title: "Native & lightweight",
    body: "Built with Tauri 2, not Electron. A real macOS app that launches fast and stays out of your way.",
  },
  {
    icon: IconTheme,
    title: "Light, dark & remembered",
    body: "Follows macOS appearance or force either. Differ remembers your layout, recent pairs, and window geometry across launches.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24 sm:px-8">
      <div className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Features</p>
        <h2 className="mt-3 text-balance font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Everything you need to compare — nothing you don&apos;t.
        </h2>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="group bg-surface p-6 transition-colors hover:bg-elevated">
            <div className="grid size-10 place-items-center rounded-lg border border-line bg-elevated text-accent transition-colors group-hover:border-accent/40">
              <Icon className="size-5" />
            </div>
            <h3 className="mt-4 font-semibold text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
