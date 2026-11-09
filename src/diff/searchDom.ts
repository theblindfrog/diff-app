/**
 * DOM side of find-in-diff: painting match highlights onto the rows that are
 * currently mounted, and scrolling a match into view. Matches themselves come
 * from the metadata walk in `search.ts`; here we only locate their rows by the
 * `data-line-index` key the renderer stamps on each one.
 *
 * Highlights use the CSS Custom Highlight API, which paints text ranges without
 * touching the library-owned DOM (wrapping text in <mark>s would fight its
 * re-renders). The `::highlight()` rules live inside the diff's shadow root via
 * the `unsafeCSS` option — see SEARCH_HIGHLIGHT_CSS.
 */

import type { Layout } from "../types";
import type { SearchMatch, VisibleLine } from "./search";
import { getDiffScroller } from "./navigation";

const HIGHLIGHT = "diff-search";
const HIGHLIGHT_ACTIVE = "diff-search-active";
const FALLBACK_ROW_HEIGHT = 20;
/** Place the target row ~35% down the viewport, matching change navigation. */
const VIEWPORT_ANCHOR = 0.35;

/** Injected into the diff's shadow root (custom highlights are styled from the
 * tree that holds the ranges). */
export const SEARCH_HIGHLIGHT_CSS = `
::highlight(${HIGHLIGHT}) { background-color: rgba(255, 200, 0, 0.45); color: inherit; }
::highlight(${HIGHLIGHT_ACTIVE}) { background-color: rgba(255, 140, 0, 0.9); color: #000; }
`;

const supportsHighlights = () => typeof CSS !== "undefined" && "highlights" in CSS;

function getShadowRoot(): ShadowRoot | null {
  return document.querySelector("diffs-container")?.shadowRoot ?? null;
}

/** Whether a rendered code row (`data-line-type`) can show a match on `side`. */
function rowShows(row: Element, match: SearchMatch): boolean {
  const type = row.getAttribute("data-line-type") ?? "";
  if (match.line.side === "deletion") return type === "change-deletion";
  if (match.line.side === "addition") return type === "change-addition";
  return type.startsWith("context") || type === "";
}

/** Rendered code rows (not gutter rows) for a match's line. Context lines have
 * a row in each column in split view. */
function rowsFor(sr: ParentNode, match: SearchMatch): HTMLElement[] {
  const rows = sr.querySelectorAll<HTMLElement>(`[data-line][data-line-index="${match.line.key}"]`);
  return [...rows].filter((r) => rowShows(r, match));
}

/** A Range over characters [start, end) of a row's text, which the
 * highlighter splits across many token <span>s. */
function rangeIn(row: HTMLElement, start: number, end: number): Range | null {
  const walker = document.createTreeWalker(row, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let offset = 0;
  let started = false;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const len = node.nodeValue?.length ?? 0;
    if (!started && start < offset + len) {
      range.setStart(node, start - offset);
      started = true;
    }
    if (started && end <= offset + len) {
      range.setEnd(node, end - offset);
      return range;
    }
    offset += len;
  }
  return null;
}

/**
 * Highlights every match whose row is mounted, with the active one emphasized.
 * Cheap enough to re-run on every render of the virtualized window: work is
 * bounded by the mounted rows, not the total match count.
 */
export function paintHighlights(byKey: Map<string, SearchMatch[]>, active: SearchMatch | null) {
  if (!supportsHighlights()) return;
  const sr = getShadowRoot();
  const all: Range[] = [];
  const current: Range[] = [];
  if (sr && byKey.size > 0) {
    for (const row of sr.querySelectorAll<HTMLElement>("[data-line][data-line-index]")) {
      const hits = byKey.get(row.getAttribute("data-line-index") ?? "");
      if (!hits) continue;
      for (const m of hits) {
        if (!rowShows(row, m)) continue;
        const range = rangeIn(row, m.start, m.end);
        if (!range) continue;
        (m === active ? current : all).push(range);
      }
    }
  }
  CSS.highlights.set(HIGHLIGHT, new Highlight(...all));
  CSS.highlights.set(HIGHLIGHT_ACTIVE, new Highlight(...current));
}

export function clearHighlights() {
  if (!supportsHighlights()) return;
  CSS.highlights.delete(HIGHLIGHT);
  CSS.highlights.delete(HIGHLIGHT_ACTIVE);
}

/** Row index of a line in the active layout. */
const rowOf = (line: VisibleLine, layout: Layout) =>
  layout === "split" ? line.splitRow : line.unifiedRow;

/**
 * How many rendered rows, and folded-region separators, sit above `target`.
 * Rows of folded lines aren't rendered, so the target's on-screen position is
 * its rank among visible rows, plus one separator per gap before it.
 */
function rowsAbove(lines: VisibleLine[], target: VisibleLine, layout: Layout) {
  const targetRow = rowOf(target, layout);
  const rows = new Set<number>();
  for (const l of lines) {
    const r = rowOf(l, layout);
    if (r < targetRow) rows.add(r);
  }
  const sorted = [...rows].sort((a, b) => a - b);
  let separators = sorted.length > 0 ? (sorted[0] > 0 ? 1 : 0) : targetRow > 0 ? 1 : 0;
  for (let i = 1; i < sorted.length; i++) if (sorted[i] > sorted[i - 1] + 1) separators++;
  if (sorted.length > 0 && targetRow > sorted[sorted.length - 1] + 1) separators++;
  return { rows: sorted.length, separators };
}

function measure(sr: ShadowRoot | null, selector: string, fallback: number): number {
  const h = sr?.querySelector<HTMLElement>(selector)?.getBoundingClientRect().height ?? 0;
  return h > 0 ? h : fallback;
}

/** Nearest ancestor (within the shadow tree) that scrolls horizontally. */
function horizontalScroller(el: HTMLElement): HTMLElement | null {
  for (let n: HTMLElement | null = el.parentElement; n; n = n.parentElement) {
    if (n.scrollWidth > n.clientWidth) {
      const ox = getComputedStyle(n).overflowX;
      if (ox === "auto" || ox === "scroll") return n;
    }
  }
  return null;
}

/** Snap onto the mounted row; returns false if it hasn't rendered yet. */
function refine(scroller: HTMLElement, match: SearchMatch): boolean {
  const sr = getShadowRoot();
  const row = sr ? rowsFor(sr, match)[0] : undefined;
  if (!row) return false;

  // Aim at the matched text rather than the row: a wrapped line can be taller
  // than the viewport, with the match far below the row's top.
  const range = rangeIn(row, match.start, match.end);
  const target = (range ?? row).getBoundingClientRect();

  // Leave the scroll alone if the match is already on screen, so stepping
  // through nearby matches doesn't jolt the view.
  const sc = scroller.getBoundingClientRect();
  if (target.top < sc.top || target.bottom > sc.bottom) {
    const top = target.top - sc.top + scroller.scrollTop;
    scroller.scrollTo({ top: Math.max(0, top - scroller.clientHeight * VIEWPORT_ANCHOR) });
  }

  // Bring the match itself into horizontal view on long unwrapped lines.
  const hs = horizontalScroller(row);
  if (range && hs) {
    const box = hs.getBoundingClientRect();
    if (target.left < box.left || target.right > box.right) {
      hs.scrollLeft += target.left - box.left - (box.width - target.width) / 2;
    }
  }
  return true;
}

/** Layout row index encoded in a rendered row's `data-line-index` ("u,s" for
 * diffs, a single index for the plain file view). */
function mountedRowIndex(key: string, layout: Layout): number {
  const [u, s] = key.split(",");
  return Number(layout === "split" && s != null ? s : u);
}

/** Rank of `row` among the sorted visible rows (its on-screen order). */
function ordinalOf(order: number[], row: number): number {
  let lo = 0;
  let hi = order.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (order[mid] < row) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/**
 * When the target hasn't mounted, re-estimate its position from the rows that
 * have: take the mounted row nearest it in on-screen order and step from there
 * by the mounted rows' average height. Corrects estimates thrown off by rows of
 * uneven height (word wrap), converging as the window moves toward the target.
 */
function correctTowards(scroller: HTMLElement, targetOrd: number, order: number[], layout: Layout) {
  const sr = getShadowRoot();
  if (!sr) return;
  const sc = scroller.getBoundingClientRect();
  let nearest: { ord: number; top: number } | null = null;
  let total = 0;
  let count = 0;
  const seen = new Set<string>();
  for (const el of sr.querySelectorAll<HTMLElement>("[data-line][data-line-index]")) {
    const r = el.getBoundingClientRect();
    if (r.height === 0) continue;
    const key = el.getAttribute("data-line-index")!;
    // Split view mounts one row per column; count each row once.
    if (!seen.has(key)) {
      seen.add(key);
      total += r.height;
      count++;
    }
    const ord = ordinalOf(order, mountedRowIndex(key, layout));
    if (!nearest || Math.abs(ord - targetOrd) < Math.abs(nearest.ord - targetOrd)) {
      nearest = { ord, top: r.top - sc.top + scroller.scrollTop };
    }
  }
  if (!nearest || count === 0) return;
  const top = nearest.top + (targetOrd - nearest.ord) * (total / count);
  scroller.scrollTo({ top: Math.max(0, top - scroller.clientHeight * VIEWPORT_ANCHOR) });
}

/**
 * Scrolls `match` into view. A coarse jump estimated from the metadata mounts
 * its region in the virtualizer, then a DOM pass snaps onto the real row. While
 * the row is still missing, each frame re-estimates from the rows that did
 * mount, so uneven row heights can't leave the match off-screen.
 */
export function scrollToMatch(match: SearchMatch, lines: VisibleLine[], layout: Layout): void {
  const scroller = getDiffScroller();
  if (!scroller) return;

  if (refine(scroller, match)) return;

  const sr = getShadowRoot();
  const rowHeight = measure(sr, "[data-line][data-line-index]", FALLBACK_ROW_HEIGHT);
  const sepHeight = measure(sr, "[data-separator]", rowHeight * 1.6);
  const { rows, separators } = rowsAbove(lines, match.line, layout);
  const estimatedTop = rows * rowHeight + separators * sepHeight;
  scroller.scrollTo({ top: Math.max(0, estimatedTop - scroller.clientHeight * VIEWPORT_ANCHOR) });

  const order = [...new Set(lines.map((l) => rowOf(l, layout)))].sort((a, b) => a - b);
  const targetOrd = ordinalOf(order, rowOf(match.line, layout));
  let tries = 30;
  const attempt = () => {
    if (refine(scroller, match) || --tries <= 0) return;
    correctTowards(scroller, targetOrd, order, layout);
    requestAnimationFrame(attempt);
  };
  requestAnimationFrame(attempt);
}
