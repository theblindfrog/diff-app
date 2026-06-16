import { getFiletypeFromFileName } from "@pierre/diffs";

/**
 * Languages offered in the manual picker. `id` is the Shiki language id passed
 * to @pierre/diffs; `label` is the display name. Keep roughly aligned with
 * PRELOAD_LANGS in platform/highlighter.ts.
 */
export const LANGUAGE_OPTIONS: { id: string; label: string }[] = [
  { id: "text", label: "Plain text" },
  { id: "typescript", label: "TypeScript" },
  { id: "tsx", label: "TSX" },
  { id: "javascript", label: "JavaScript" },
  { id: "jsx", label: "JSX" },
  { id: "json", label: "JSON" },
  { id: "python", label: "Python" },
  { id: "rust", label: "Rust" },
  { id: "go", label: "Go" },
  { id: "java", label: "Java" },
  { id: "c", label: "C" },
  { id: "cpp", label: "C++" },
  { id: "csharp", label: "C#" },
  { id: "ruby", label: "Ruby" },
  { id: "php", label: "PHP" },
  { id: "swift", label: "Swift" },
  { id: "kotlin", label: "Kotlin" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "scss", label: "SCSS" },
  { id: "shellscript", label: "Shell" },
  { id: "yaml", label: "YAML" },
  { id: "toml", label: "TOML" },
  { id: "sql", label: "SQL" },
  { id: "markdown", label: "Markdown" },
];

/**
 * Best-effort language id from a filename, falling back to "text". Names without
 * a recognizable extension (e.g. Paste mode's "Original"/"Modified") resolve to
 * "text".
 */
export function detectLanguage(name: string): string {
  if (!name) return "text";
  try {
    return getFiletypeFromFileName(name) || "text";
  } catch {
    return "text";
  }
}

/**
 * The effective language for the diff: a manual override always wins, otherwise
 * auto-detect from whichever side has a filename.
 */
export function effectiveLanguage(
  override: string | null,
  newName: string,
  oldName: string,
): string {
  if (override) return override;
  return detectLanguage(newName || oldName);
}
