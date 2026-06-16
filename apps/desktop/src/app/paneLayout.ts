/** Minimum height (px) of the top input area. */
export const MIN_TOP_PANE = 96;
/** Minimum height (px) reserved for the diff below. */
export const MIN_BOTTOM = 160;

/** Largest the top area may be, given the inputs container's viewport top. */
export function maxTopHeight(inputsTop: number): number {
  return Math.max(MIN_TOP_PANE, window.innerHeight - inputsTop - MIN_BOTTOM);
}

/** Clamps a desired top-area height to the usable range for the current window. */
export function clampTopHeight(height: number, inputsTop: number): number {
  return Math.min(Math.max(height, MIN_TOP_PANE), maxTopHeight(inputsTop));
}
