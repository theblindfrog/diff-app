/**
 * Find-in-diff. The search runs over the parsed diff metadata, not the DOM:
 * the diff is virtualized (off-screen rows aren't mounted) so a DOM text search
 * would miss most of the file. Instead we enumerate exactly the lines the
 * renderer shows — hunk content, plus any unchanged context the user has
 * expanded — mirroring @pierre/diffs' own `iterateOverDiff` walk. Lines folded
 * away inside a collapsed "N unmodified lines" separator are never searched.
 *
 * Each visible line carries the same `data-line-index` key ("unified,split")
 * the renderer stamps on its row, so a match can be found in the DOM once its
 * row mounts (for highlighting and scroll refinement).
 */

import type { FileDiffMetadata, HunkExpansionRegion } from "@pierre/diffs";
import type { Layout } from "../types";

/** Which column a line lives in. Context lines appear in both. */
export type LineSide = "deletion" | "addition" | "context";

export interface VisibleLine {
  side: LineSide;
  text: string;
  /** Rendered row index in unified layout (counts folded rows too). */
  unifiedRow: number;
  /** Rendered row index in split layout (counts folded rows too). */
  splitRow: number;
  /** The row's `data-line-index` attribute value. */
  key: string;
}

export interface SearchMatch {
  line: VisibleLine;
  /** Character offsets of the match within the line text. */
  start: number;
  end: number;
}

/** Expansion state keyed by hunk index (`hunks.length` = trailing region). */
export type ExpandedHunks = ReadonlyMap<number, HunkExpansionRegion>;

/** The library's default: gaps this small are always shown, never folded. */
const COLLAPSED_CONTEXT_THRESHOLD = 1;

function sideStartBoundary(start: number, count: number): number {
  return start - (count === 0 ? 0 : 1);
}

/** How many of a folded gap's lines are shown, from its top and bottom. */
function expandedRegion(
  rangeSize: number,
  region: HunkExpansionRegion | undefined,
  allowFromEnd: boolean,
): { fromStart: number; fromEnd: number } {
  const size = Math.max(rangeSize, 0);
  if (size === 0) return { fromStart: 0, fromEnd: 0 };
  if (size <= COLLAPSED_CONTEXT_THRESHOLD) return { fromStart: size, fromEnd: 0 };
  const fromStart = Math.min(Math.max(region?.fromStart ?? 0, 0), size);
  const fromEnd = allowFromEnd ? Math.min(Math.max(region?.fromEnd ?? 0, 0), size) : 0;
  if (fromStart + fromEnd >= size) return { fromStart: size, fromEnd: 0 };
  return { fromStart, fromEnd };
}

/** Unchanged lines after the last hunk (shown only when expanded). */
function trailingRangeSize(fd: FileDiffMetadata): number {
  const last = fd.hunks[fd.hunks.length - 1];
  if (!last || fd.isPartial || fd.additionLines.length === 0 || fd.deletionLines.length === 0) {
    return 0;
  }
  const add =
    fd.additionLines.length -
    (sideStartBoundary(last.additionStart, last.additionCount) + last.additionCount);
  const del =
    fd.deletionLines.length -
    (sideStartBoundary(last.deletionStart, last.deletionCount) + last.deletionCount);
  return Math.max(0, Math.min(add, del));
}

/** Strips the line terminator the parser keeps on each line. */
function clean(line: string | undefined): string {
  if (line == null) return "";
  return line.endsWith("\r\n") ? line.slice(0, -2) : line.endsWith("\n") ? line.slice(0, -1) : line;
}

/**
 * Every line currently rendered for `fd`, in document order, given the
 * renderer's expansion state.
 */
export function visibleDiffLines(fd: FileDiffMetadata, expanded: ExpandedHunks): VisibleLine[] {
  const out: VisibleLine[] = [];
  const push = (side: LineSide, text: string | undefined, u: number, s: number) =>
    out.push({ side, text: clean(text), unifiedRow: u, splitRow: s, key: `${u},${s}` });

  // Context rows (expanded or in-hunk) show the new side's text.
  const context = (count: number, u: number, s: number, addIdx: number) => {
    for (let i = 0; i < count; i++) push("context", fd.additionLines[addIdx + i], u + i, s + i);
  };

  let u = 0;
  let s = 0;
  let addIdx = 0;
  let delIdx = 0;

  fd.hunks.forEach((hunk, hunkIndex) => {
    const delBoundary = sideStartBoundary(hunk.deletionStart, hunk.deletionCount);
    const addBoundary = sideStartBoundary(hunk.additionStart, hunk.additionCount);
    delIdx = !fd.isPartial && hunk.deletionCount === 0 ? delBoundary : hunk.deletionLineIndex;
    addIdx = !fd.isPartial && hunk.additionCount === 0 ? addBoundary : hunk.additionLineIndex;

    // The folded gap before this hunk: its top `fromStart` and bottom `fromEnd`
    // lines may have been expanded by the user.
    const gap = fd.isPartial ? 0 : hunk.collapsedBefore;
    const lead = expandedRegion(gap, expanded.get(hunkIndex), true);
    context(lead.fromStart, hunk.unifiedLineStart - gap, hunk.splitLineStart - gap, addIdx - gap);
    context(
      lead.fromEnd,
      hunk.unifiedLineStart - lead.fromEnd,
      hunk.splitLineStart - lead.fromEnd,
      addIdx - lead.fromEnd,
    );

    u = hunk.unifiedLineStart;
    s = hunk.splitLineStart;
    for (const content of hunk.hunkContent) {
      if (content.type === "context") {
        context(content.lines, u, s, addIdx);
        u += content.lines;
        s += content.lines;
        addIdx += content.lines;
        delIdx += content.lines;
      } else {
        for (let i = 0; i < content.deletions; i++) {
          push("deletion", fd.deletionLines[delIdx + i], u + i, s + i);
        }
        for (let i = 0; i < content.additions; i++) {
          push("addition", fd.additionLines[addIdx + i], u + content.deletions + i, s + i);
        }
        u += content.deletions + content.additions;
        s += Math.max(content.deletions, content.additions);
        addIdx += content.additions;
        delIdx += content.deletions;
      }
    }
  });

  // The gap after the last hunk only expands downward from its top.
  if (fd.hunks.length > 0) {
    const tail = expandedRegion(trailingRangeSize(fd), expanded.get(fd.hunks.length), false);
    context(tail.fromStart, u, s, addIdx);
  }

  return out;
}

/** All lines of a file rendered plainly (identical sides — nothing folds). */
export function plainFileLines(text: string): VisibleLine[] {
  if (text.length === 0) return [];
  const lines = text.split("\n");
  if (lines[lines.length - 1] === "") lines.pop();
  return lines.map((line, i) => ({
    side: "context",
    text: clean(line),
    unifiedRow: i,
    splitRow: i,
    key: String(i),
  }));
}

/**
 * Lowercases `text`, returning the lowered string and a map from each of its
 * code-unit offsets (plus the end) back to an offset in `text`. Lowercasing
 * can change length (e.g. "İ" → "i̇"), so match offsets in the lowered string
 * aren't valid in the original without this. Null when lengths agree and
 * offsets carry over as-is.
 */
function lowerWithOffsets(text: string): { lower: string; toOrig: number[] | null } {
  const lower = text.toLowerCase();
  if (lower.length === text.length) return { lower, toOrig: null };
  // Search the whole-string result (it applies context rules such as Greek
  // final sigma, matching how the query is lowered); lower one character at a
  // time only to learn which source character each output unit came from.
  // Context rules swap characters but never change their length, so the map
  // lines up with `lower`.
  let perChar = "";
  const toOrig: number[] = [];
  for (let i = 0; i < text.length;) {
    const ch = String.fromCodePoint(text.codePointAt(i)!);
    const low = ch.toLowerCase();
    for (let k = 0; k < low.length; k++) toOrig.push(i);
    perChar += low;
    i += ch.length;
  }
  toOrig.push(text.length);
  // Should the lengths ever disagree, search the per-character result, which
  // the map is guaranteed to fit.
  return { lower: perChar.length === lower.length ? lower : perChar, toOrig };
}

/** Original-text offset just past the character that lowered-offset `i - 1`
 * came from, so a match ending inside an expanded character covers all of it. */
function origEndOf(text: string, toOrig: number[], i: number): number {
  if (i === 0) return 0;
  const src = toOrig[i - 1];
  return src + String.fromCodePoint(text.codePointAt(src)!).length;
}

/**
 * Case-(in)sensitive substring matches across `lines`, ordered as they read on
 * screen for `layout` (in split view the left column's line comes first).
 */
export function findMatches(
  lines: VisibleLine[],
  query: string,
  caseSensitive: boolean,
  layout: Layout,
): SearchMatch[] {
  if (query.length === 0) return [];
  const needle = caseSensitive ? query : query.toLowerCase();
  const matches: SearchMatch[] = [];
  for (const line of lines) {
    const { lower: hay, toOrig } = caseSensitive
      ? { lower: line.text, toOrig: null }
      : lowerWithOffsets(line.text);
    let from = 0;
    for (;;) {
      const at = hay.indexOf(needle, from);
      if (at < 0) break;
      const end = at + needle.length;
      // Offsets must index the original text, which is what the row renders.
      const start = toOrig ? toOrig[at] : at;
      const origEnd = toOrig ? origEndOf(line.text, toOrig, end) : end;
      matches.push({ line, start, end: origEnd });
      from = end;
    }
  }
  if (layout === "split") {
    // Split rows pair a deletion with an addition; read the left one first.
    const col = (m: SearchMatch) => (m.line.side === "addition" ? 1 : 0);
    matches.sort(
      (a, b) => a.line.splitRow - b.line.splitRow || col(a) - col(b) || a.start - b.start,
    );
  }
  return matches;
}
