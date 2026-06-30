import { preloadHighlighter } from "@pierre/diffs";
import type { DiffsThemeNames, SupportedLanguages } from "@pierre/diffs";

/** Themes the diff renderer uses; it picks light/dark based on `themeType`. */
export const THEMES: DiffsThemeNames[] = ["github-light", "github-dark"];

/**
 * Max line length (chars) for which the library computes an intra-line (word/
 * char) diff. The library default is 1000 — above it, a changed line gets NO
 * `[data-diff-span]` segments, so a small edit buried in a long line (e.g. a
 * 9000-char CSV row) shows no sub-change highlight at all. We raise it so those
 * lines still get pinpointed. Bounded (not unlimited) because the underlying
 * Myers diff is worst-case O(n·m) on a fully-rewritten line; it runs in the
 * worker pool and is virtualized, so realistic CSV/log rows stay smooth.
 */
export const MAX_LINE_DIFF_LENGTH = 50_000;

/**
 * Languages preloaded into the shared Shiki highlighter so the first render of
 * a common file type doesn't flash unstyled. Other languages still resolve on
 * demand. Keep this roughly aligned with the LanguagePicker options.
 */
export const PRELOAD_LANGS: SupportedLanguages[] = [
  "text",
  "typescript",
  "tsx",
  "javascript",
  "jsx",
  "json",
  "python",
  "rust",
  "go",
  "java",
  "c",
  "cpp",
  "csharp",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "html",
  "css",
  "scss",
  "shellscript",
  "yaml",
  "toml",
  "sql",
  "markdown",
  "diff",
];

let started: Promise<void> | null = null;

/** Idempotent: kicks off (and reuses) the shared highlighter preload. */
export function ensureHighlighter(): Promise<void> {
  if (!started) {
    started = preloadHighlighter({ themes: THEMES, langs: PRELOAD_LANGS }).catch((err) => {
      // Reset so a later call can retry; rendering still works via on-demand load.
      started = null;
      console.error("Failed to preload highlighter", err);
    });
  }
  return started;
}
