/**
 * Change-block navigation. The diff renders into a `<diffs-container>` custom
 * element (open shadow DOM) inside our `.diff-scroll` light-DOM scroller. We
 * find the vertical offset of each change block and scroll the container.
 *
 * Layout-agnostic: in split view a hunk's deletions/additions share a row top;
 * in unified view they stack but stay adjacent. Either way, consecutive change
 * lines collapse into one block and context gaps separate blocks.
 */

export function getDiffScroller(): HTMLElement | null {
  return document.querySelector<HTMLElement>(".diff-scroll");
}

function getChangeHost(): HTMLElement | null {
  return document.querySelector<HTMLElement>("diffs-container");
}

/** Sorted vertical offsets (in scroller content space) of each change block. */
export function getChangeBlockTops(): number[] {
  const scroller = getDiffScroller();
  const host = getChangeHost();
  if (!scroller || !host?.shadowRoot) return [];

  const changeEls = host.shadowRoot.querySelectorAll<HTMLElement>('[data-line-type^="change-"]');
  if (changeEls.length === 0) return [];

  const scRect = scroller.getBoundingClientRect();
  const tops = new Set<number>();
  let lineHeight = Number.POSITIVE_INFINITY;
  for (const el of changeEls) {
    const r = el.getBoundingClientRect();
    if (r.height === 0) continue;
    tops.add(Math.round(r.top - scRect.top + scroller.scrollTop));
    if (r.height < lineHeight) lineHeight = r.height;
  }
  if (!Number.isFinite(lineHeight)) lineHeight = 20;

  // A new block starts when a change row is more than ~1.5 rows below the
  // previous one — i.e. context lines separate them. Single-line hunks work
  // because consecutive hunks are always > 1 row apart.
  const sorted = [...tops].sort((a, b) => a - b);
  const threshold = lineHeight * 1.5;

  const blocks: number[] = [];
  let prev = Number.NEGATIVE_INFINITY;
  for (const top of sorted) {
    if (top - prev > threshold) blocks.push(top);
    prev = top;
  }
  return blocks;
}

/** Number of change blocks currently rendered (used to size navigation). */
export function getChangeBlockCount(): number {
  return getChangeBlockTops().length;
}

/** Scrolls the diff so the change block at `index` is centered. Returns the
 * clamped index actually scrolled to, or -1 if there are no blocks. */
export function scrollToHunk(index: number): number {
  const scroller = getDiffScroller();
  const blocks = getChangeBlockTops();
  if (!scroller || blocks.length === 0) return -1;

  const i = Math.max(0, Math.min(index, blocks.length - 1));
  const top = Math.max(0, blocks[i] - scroller.clientHeight * 0.35);
  scroller.scrollTo({ top, behavior: "smooth" });
  return i;
}
