import type { SideInput } from "../../types";

export type DockPlacement =
  /** One file, Original empty: fill Original, preserving Modified. */
  | { kind: "old" }
  /** One file, only Original filled: fill Modified. */
  | { kind: "new" }
  /** One file, both filled: clear the comparison and load Original. */
  | { kind: "replace-old" }
  /** Two files: replace both sides, in the order supplied. */
  | { kind: "both" };

/** A path, or nonempty pasted text, counts as filled — even a path to an empty file. */
function isFilled(side: SideInput): boolean {
  return Boolean(side.path) || side.text.length > 0;
}

/** Decides where dropped files land, given the current sides and file count. */
export function resolveDockPlacement(
  old: SideInput,
  newSide: SideInput,
  fileCount: number,
): DockPlacement {
  if (fileCount >= 2) return { kind: "both" };
  if (!isFilled(old)) return { kind: "old" };
  if (!isFilled(newSide)) return { kind: "new" };
  return { kind: "replace-old" };
}
