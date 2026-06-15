/** True when running inside the Tauri shell (vs. a plain browser dev server). */
export const isTauri =
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

/** The final path segment of a file path (POSIX or Windows separators). */
export function basename(path: string): string {
  const parts = path.split(/[\\/]/);
  return parts[parts.length - 1] || path;
}
