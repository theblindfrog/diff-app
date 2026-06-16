/**
 * Central site configuration. Edit these values rather than hunting through components.
 */
export const site = {
  name: "Differ",
  /** One-line value proposition, reused in metadata + hero. */
  tagline: "A fast, native macOS app for diffing code & text.",
  description:
    "Differ is a focused macOS app for comparing two files or two blocks of text. " +
    "Open files and it watches them live, re-diffing the moment you save; paste snippets and it diffs as you type. " +
    "Word-level diffs, split or unified layouts, and GitHub-quality syntax highlighting across 24 languages.",
  /** Canonical URL — update when the real domain is set. */
  url: "https://differ.app",
  download: {
    /** Placeholder anchor — there is no public release yet (app is v0.1.0). */
    href: "#download",
    /** Flip to true (and point href at the real artifact) once a notarized build ships. */
    available: false,
    version: "0.1.0",
    requirements: "Apple Silicon · macOS 13 Ventura or later",
  },
  /** Optional. Leave empty to hide all GitHub links (the source is currently reference-only). */
  githubUrl: "",
  /** Credit for the underlying diff engine. */
  diffEngine: { name: "@pierre/diffs", href: "https://diffs.com" },
} as const;

export const nav = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Download", href: "#download" },
] as const;
