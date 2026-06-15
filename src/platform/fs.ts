import { readTextFile, watch } from "@tauri-apps/plugin-fs";
import { isTauri } from "./env";

export type UnwatchFn = () => void;

/** Reads a UTF-8 text file by absolute path. */
export async function readFile(path: string): Promise<string> {
  return readTextFile(path);
}

/**
 * Watches a single file, invoking `onChange` (debounced) when it changes on
 * disk. Returns an unwatch function. No-ops outside Tauri.
 */
export async function watchFile(
  path: string,
  onChange: () => void,
): Promise<UnwatchFn> {
  if (!isTauri) return () => {};
  return watch(path, () => onChange(), { delayMs: 150 });
}
