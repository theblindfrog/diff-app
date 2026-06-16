import { useCallback } from "react";
import { useDiffStore } from "../../store";
import { readFile } from "../../platform/fs";
import { basename } from "../../platform/env";
import type { Side } from "../../types";

/**
 * Loads file paths into the store's sides (reading contents from disk) and
 * records a recent pair once both sides have a path.
 */
export function useFileLoader() {
  const setSide = useDiffStore((s) => s.setSide);
  const addRecentPair = useDiffStore((s) => s.addRecentPair);

  const loadSide = useCallback(
    async (side: Side, path: string) => {
      const text = await readFile(path);
      setSide(side, { text, name: basename(path), path });

      const st = useDiffStore.getState();
      const oldPath = side === "old" ? path : st.old.path;
      const newPath = side === "new" ? path : st.new.path;
      if (oldPath && newPath) addRecentPair({ oldPath, newPath });
    },
    [setSide, addRecentPair],
  );

  const loadPair = useCallback(
    async (paths: string[]) => {
      if (paths[0]) await loadSide("old", paths[0]);
      if (paths[1]) await loadSide("new", paths[1]);
    },
    [loadSide],
  );

  return { loadSide, loadPair };
}
