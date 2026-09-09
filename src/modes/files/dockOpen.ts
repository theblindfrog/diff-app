import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { readFile as readFileBytes } from "@tauri-apps/plugin-fs";
import { useDiffStore } from "../../store";
import { basename, isTauri } from "../../platform/env";
import { showError } from "../../platform/dialog";
import { resolveDockPlacement } from "./dockPlacement";
import type { SideInput } from "../../types";

/** Must match `DOCK_OPEN_PENDING_EVENT` in `src-tauri/src/dock_open.rs`. */
const DOCK_OPEN_PENDING_EVENT = "dock-open-pending";
const MAX_FILES = 2;

interface ReadResult {
  path: string;
  name: string;
  text: string;
}

/** Reads a file and strictly decodes it as UTF-8, rejecting invalid sequences
 * (unlike `readTextFile`, which silently replaces them). */
async function readDockFile(path: string): Promise<ReadResult> {
  const bytes = await readFileBytes(path);
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error(`“${basename(path)}” isn't a text file.`);
  }
  return { path, name: basename(path), text };
}

/**
 * Applies one Dock-drop request: validates the file count, reads every file
 * before touching the store (so a failure leaves the current comparison
 * untouched), then applies the placement rule atomically.
 */
export async function applyDockRequest(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  if (paths.length > MAX_FILES) {
    await showError("Differ can only compare one or two files at a time.");
    return;
  }

  let results: ReadResult[];
  try {
    results = await Promise.all(paths.map(readDockFile));
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    await showError(`Couldn't open the dropped file.\n${detail}`);
    return;
  }

  const store = useDiffStore.getState();
  const placement = resolveDockPlacement(store.old, store.new, results.length);
  const toSideInput = (r: ReadResult): SideInput => ({ text: r.text, name: r.name, path: r.path });

  store.setMode("files");
  switch (placement.kind) {
    case "old":
      store.setSide("old", toSideInput(results[0]));
      break;
    case "new":
      store.setSide("new", toSideInput(results[0]));
      break;
    case "replace-old":
      store.clearSide("new");
      store.setSide("old", toSideInput(results[0]));
      break;
    case "both":
      store.setSide("old", toSideInput(results[0]));
      store.setSide("new", toSideInput(results[1]));
      break;
  }

  const after = useDiffStore.getState();
  if (after.old.path && after.new.path) {
    store.addRecentPair({ oldPath: after.old.path, newPath: after.new.path });
  }
}

/** Applies queued requests one at a time, each against the state left by the last. */
export async function processPendingOpens(requests: string[][]): Promise<void> {
  for (const request of requests) {
    await applyDockRequest(request);
  }
}

// Serializes drains so a live event and the post-hydration flush (or a
// duplicate mount effect under React Strict Mode) can never process the same
// pulled batch concurrently.
let drainChain: Promise<void> = Promise.resolve();

async function runDrain(): Promise<void> {
  try {
    const requests = await invoke<string[][]>("take_pending_opens");
    if (requests.length > 0) await processPendingOpens(requests);
  } catch (err) {
    console.error("Failed to process pending Dock-open requests", err);
  }
}

/** Drains and applies whatever open requests are queued on the Rust side. */
export function drainPendingOpens(): Promise<void> {
  drainChain = drainChain.then(runDrain, runDrain);
  return drainChain;
}

/**
 * Delivers files dropped on the Dock icon. Requests may queue up in Rust
 * before this subscribes (most notably on a cold launch, where the drop is
 * what spawned the process) or before settings finish loading, so the queue
 * is always drained once `hydrated` — regardless of whether the ping below
 * was received — and again on every ping while already running.
 */
export function useDockOpen(): void {
  const hydrated = useDiffStore((s) => s.hydrated);

  useEffect(() => {
    if (!isTauri) return;
    let active = true;
    let unlisten = () => {};

    listen(DOCK_OPEN_PENDING_EVENT, () => {
      if (useDiffStore.getState().hydrated) void drainPendingOpens();
    }).then((fn) => {
      if (active) unlisten = fn;
      else fn();
    });

    return () => {
      active = false;
      unlisten();
    };
  }, []);

  useEffect(() => {
    if (!isTauri || !hydrated) return;
    void drainPendingOpens();
  }, [hydrated]);
}
