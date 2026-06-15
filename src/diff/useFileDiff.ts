import { useMemo } from "react";
import { parseDiffFromFile } from "@pierre/diffs";
import type { FileContents, FileDiffMetadata } from "@pierre/diffs";

export interface DiffStats {
  adds: number;
  dels: number;
  hunks: number;
}

/**
 * Synchronously parses the same FileContents the renderer uses (LRU-cached
 * inside the library), memoized so stats/navigation stay consistent with the
 * rendered diff.
 */
export function useFileDiff(oldFile: FileContents, newFile: FileContents): FileDiffMetadata {
  return useMemo(() => parseDiffFromFile(oldFile, newFile), [oldFile, newFile]);
}

export function computeStats(fd: FileDiffMetadata): DiffStats {
  let adds = 0;
  let dels = 0;
  for (const hunk of fd.hunks) {
    adds += hunk.additionLines;
    dels += hunk.deletionLines;
  }
  return { adds, dels, hunks: fd.hunks.length };
}
