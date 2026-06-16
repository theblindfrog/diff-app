import { useEffect } from "react";
import { useDiffStore } from "../../store";
import { readFile, watchFile } from "../../platform/fs";
import { basename } from "../../platform/env";
import type { Side } from "../../types";

/**
 * Watches one side's file (if any) and re-reads it on disk changes, unless the
 * view is frozen. A content-equality guard avoids redundant re-diffs from
 * editors that save atomically (which can emit no-op change bursts).
 */
function useWatchSide(side: Side, path: string | undefined) {
  const setSide = useDiffStore((s) => s.setSide);

  useEffect(() => {
    if (!path) return;
    let active = true;
    let unwatch = () => {};

    watchFile(path, async () => {
      if (useDiffStore.getState().frozen) return;
      try {
        const text = await readFile(path);
        const current = useDiffStore.getState()[side];
        if (current.path === path && current.text !== text) {
          setSide(side, { text, name: basename(path), path });
        }
      } catch (err) {
        console.error("Failed to re-read watched file", err);
      }
    }).then((fn) => {
      if (active) unwatch = fn;
      else fn();
    });

    return () => {
      active = false;
      unwatch();
    };
  }, [path, side, setSide]);
}

export function useFileWatch() {
  const oldPath = useDiffStore((s) => s.old.path);
  const newPath = useDiffStore((s) => s.new.path);
  useWatchSide("old", oldPath);
  useWatchSide("new", newPath);
}
