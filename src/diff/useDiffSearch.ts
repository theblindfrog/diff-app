import { useMemo } from "react";
import type { FileDiffMetadata } from "@pierre/diffs";
import { useDiffStore } from "../store";
import { useDiffModel } from "./useDiffModel";
import { useFileDiff } from "./useFileDiff";
import { findMatches, plainFileLines, visibleDiffLines } from "./search";
import type { ExpandedHunks, SearchMatch, VisibleLine } from "./search";

export interface DiffSearch {
  lines: VisibleLine[];
  matches: SearchMatch[];
  /** Index of the current match in `matches`, or -1. */
  activeIndex: number;
}

/** Stable identity of a match, so the current one survives a recompute (e.g.
 * when expanding context shifts every index after it). */
export function matchId(m: SearchMatch): string {
  return `${m.line.side}|${m.line.key}|${m.start}`;
}

/** Single-entry memo shared across components: recomputes only when one of
 * the first `keyCount` arguments changes (by identity — store strings/maps
 * keep theirs). */
function memoLast<A extends unknown[], R>(
  fn: (...args: A) => R,
  keyCount = fn.length,
): (...args: A) => R {
  let lastArgs: A | null = null;
  let last!: R;
  return (...args) => {
    if (!lastArgs || args.slice(0, keyCount).some((a, i) => !Object.is(a, lastArgs![i]))) {
      last = fn(...args);
      lastArgs = args;
    }
    return last;
  };
}

// Keyed on the raw texts rather than `fd`: each component memoizes its own
// parse, but the store's strings are shared, so the scan runs once per change.
const computeLines = memoLast(
  (_old: string, newText: string, expanded: ExpandedHunks, fd: FileDiffMetadata): VisibleLine[] =>
    fd.hunks.length === 0 ? plainFileLines(newText) : visibleDiffLines(fd, expanded),
  3,
);
/** Memoized `findMatches`, shared with the hook below so an event handler
 * asking for the same query doesn't rescan. */
export const matchesFor = memoLast(findMatches);

/**
 * The visible lines and the query's matches within them. Used by both the
 * toolbar (count, navigation) and the diff (highlighting).
 */
export function useDiffSearch(): DiffSearch {
  const { oldFile, newFile } = useDiffModel();
  const fd = useFileDiff(oldFile, newFile);
  const expanded = useDiffStore((s) => s.expandedHunks);
  const query = useDiffStore((s) => s.searchQuery);
  const caseSensitive = useDiffStore((s) => s.searchCaseSensitive);
  const activeId = useDiffStore((s) => s.searchActiveId);
  const layout = useDiffStore((s) => s.layout);

  // Identical sides render as a plain file (see DiffView) with every line shown.
  // `fd` is derived from the two texts, so it's passed along but not compared.
  const lines = computeLines(oldFile.contents, newFile.contents, expanded, fd);
  const matches = matchesFor(lines, query, caseSensitive, layout);
  const activeIndex = useMemo(
    () => (activeId == null ? -1 : matches.findIndex((m) => matchId(m) === activeId)),
    [matches, activeId],
  );

  return { lines, matches, activeIndex };
}
