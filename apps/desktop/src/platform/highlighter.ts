import { preloadHighlighter } from "@pierre/diffs";
import type { DiffsThemeNames, SupportedLanguages } from "@pierre/diffs";

/** Themes the diff renderer uses; it picks light/dark based on `themeType`. */
export const THEMES: DiffsThemeNames[] = ["github-light", "github-dark"];

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
