export type Side = "old" | "new";
export type Mode = "files" | "paste";
export type Layout = "split" | "unified";
/** Maps directly to @pierre/diffs `options.themeType`. */
export type ThemeType = "system" | "light" | "dark";

/** One side's input. `path` is set only in Files mode. */
export interface SideInput {
  text: string;
  /** Filename shown in the diff header and used for language inference. */
  name: string;
  path?: string;
}

/** A previously-compared file pair, for the Recents list. */
export interface RecentPair {
  oldPath: string;
  newPath: string;
}
