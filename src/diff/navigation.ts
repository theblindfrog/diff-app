/**
 * Change navigation. The diff renders into a `<diffs-container>` custom element
 * (open shadow DOM) inside our `.diff-scroll` scroller. The diff is virtualized,
 * so off-screen rows are NOT in the DOM — we can't measure every change row up
 * front. Instead we drive navigation off the parsed diff metadata: each `Hunk`
 * carries its rendered row index for the active layout (`splitLineStart` /
 * `unifiedLineStart`), which we turn into an approximate scroll offset. A second
 * DOM-measured pass then snaps onto the real change row once it has rendered,
 * absorbing header offsets and variable row heights (e.g. word-wrap).
 */

import type { Hunk } from "@pierre/diffs";
import type { Layout } from "../types";

const FALLBACK_ROW_HEIGHT = 20;
const CHANGE_ROW_SELECTOR = '[data-line-type^="change-"]';
/** Place the target row ~35% down the viewport, matching the old behavior. */
const VIEWPORT_ANCHOR = 0.35;

export function getDiffScroller(): HTMLElement | null {
  return document.querySelector<HTMLElement>(".diff-scroll");
}

function getChangeHost(): HTMLElement | null {
  return document.querySelector<HTMLElement>("diffs-container");
}

/** Rendered row index where a hunk starts, for the active layout. */
function hunkRowStart(hunk: Hunk, layout: Layout): number {
  return layout === "split" ? hunk.splitLineStart : hunk.unifiedLineStart;
}

/** Height of a single rendered diff row, measured from the DOM when possible. */
function measureRowHeight(host: HTMLElement | null): number {
  const row = host?.shadowRoot?.querySelector<HTMLElement>("[data-line-type]");
  const h = row?.getBoundingClientRect().height ?? 0;
  return h > 0 ? h : FALLBACK_ROW_HEIGHT;
}

/** Content-space top (px within the scroller) of the rendered element nearest
 * `estimatedTop`, or null if none of the candidates are rendered. */
function nearestTop(
  scroller: HTMLElement,
  candidates: Iterable<HTMLElement>,
  estimatedTop: number,
): number | null {
  const scTop = scroller.getBoundingClientRect().top;
  let bestTop: number | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const el of candidates) {
    const r = el.getBoundingClientRect();
    if (r.height === 0) continue;
    const top = r.top - scTop + scroller.scrollTop;
    const dist = Math.abs(top - estimatedTop);
    if (dist < bestDist) {
      bestDist = dist;
      bestTop = top;
    }
  }
  return bestTop;
}

/**
 * Once the coarse scroll has rendered the target region, snap onto the real
 * row nearest the metadata estimate. This corrects for the file-header offset
 * and variable row heights (e.g. word-wrap), which the uniform-height estimate
 * can't account for. Every row inside a hunk carries the `change-` line-type, so
 * the nearest one is the hunk's start.
 */
function refine(scroller: HTMLElement, estimatedTop: number): void {
  const sr = getChangeHost()?.shadowRoot;
  if (!sr) return;

  const top = nearestTop(scroller, sr.querySelectorAll<HTMLElement>(CHANGE_ROW_SELECTOR), estimatedTop);
  if (top != null) {
    scroller.scrollTo({
      top: Math.max(0, top - scroller.clientHeight * VIEWPORT_ANCHOR),
      behavior: "smooth",
    });
  }
}

/**
 * Scrolls the diff so the hunk at `index` is anchored near the top of the
 * viewport. Returns the clamped index actually scrolled to, or -1 if there are
 * no hunks.
 */
export function scrollToHunk(hunks: Hunk[], index: number, layout: Layout): number {
  const scroller = getDiffScroller();
  if (!scroller || hunks.length === 0) return -1;

  const i = Math.max(0, Math.min(index, hunks.length - 1));
  const hunk = hunks[i];
  const host = getChangeHost();
  const rowHeight = measureRowHeight(host);
  const estimatedTop = hunkRowStart(hunk, layout) * rowHeight;

  // Coarse jump (instant) brings the hunk into the virtualizer's render window
  // so its rows mount; then we snap onto the real change row next frame.
  scroller.scrollTo({ top: Math.max(0, estimatedTop - scroller.clientHeight * VIEWPORT_ANCHOR) });
  requestAnimationFrame(() => requestAnimationFrame(() => refine(scroller, estimatedTop)));

  return i;
}
