import { create } from "zustand";
import type { HunkExpansionRegion } from "@pierre/diffs";
import type { Layout, LineDiffType, Mode, RecentPair, Side, SideInput, ThemeType } from "../types";

const MAX_RECENTS = 12;

/** Default header labels for Paste mode (no real filename). */
export const PASTE_NAMES: Record<Side, string> = {
  old: "Original",
  new: "Modified",
};

export interface DiffState {
  mode: Mode;
  old: SideInput;
  new: SideInput;
  layout: Layout;
  themeType: ThemeType;
  /** Word- vs character-level highlighting of changes within a line. */
  lineDiffType: LineDiffType;
  /** When true, long lines soft-wrap instead of scrolling horizontally. */
  wordWrap: boolean;
  /** null = auto-detect from filename; otherwise a Shiki language id. */
  languageOverride: string | null;
  /** Files mode: when true, on-disk changes are ignored (kept watching). */
  frozen: boolean;
  /** Side currently highlighted as a drag-and-drop target, if any. */
  dropTarget: Side | null;
  /** Height (px) of the top input area; the diff fills the rest. Resizable. */
  topPaneHeight: number;
  recentPairs: RecentPair[];
  /** Find-in-diff query ("" = no search). */
  searchQuery: string;
  searchCaseSensitive: boolean;
  /** Identity of the current match (see `matchId`), or null for none. */
  searchActiveId: string | null;
  /** The renderer's expanded-context state, mirrored so search can skip folded
   * lines. Keyed by hunk index; `hunks.length` is the trailing region. */
  expandedHunks: ReadonlyMap<number, HunkExpansionRegion>;
  /** True once persisted prefs have been loaded (avoids first-paint flicker). */
  hydrated: boolean;

  setMode: (mode: Mode) => void;
  setSide: (side: Side, input: SideInput) => void;
  setText: (side: Side, text: string) => void;
  clearSide: (side: Side) => void;
  swapSides: () => void;
  setLayout: (layout: Layout) => void;
  toggleLayout: () => void;
  setThemeType: (themeType: ThemeType) => void;
  setLineDiffType: (lineDiffType: LineDiffType) => void;
  setWordWrap: (wordWrap: boolean) => void;
  toggleWordWrap: () => void;
  setLanguageOverride: (lang: string | null) => void;
  setFrozen: (frozen: boolean) => void;
  toggleFrozen: () => void;
  setDropTarget: (side: Side | null) => void;
  setTopPaneHeight: (height: number) => void;
  addRecentPair: (pair: RecentPair) => void;
  removeRecentPair: (pair: RecentPair) => void;
  setSearchQuery: (query: string) => void;
  toggleSearchCaseSensitive: () => void;
  setSearchActiveId: (id: string | null) => void;
  setExpandedHunks: (expanded: ReadonlyMap<number, HunkExpansionRegion>) => void;
  hydrate: (partial: Partial<DiffState>) => void;
}

const emptyPasteSide = (side: Side): SideInput => ({
  text: "",
  name: PASTE_NAMES[side],
});

const emptyFileSide = (): SideInput => ({ text: "", name: "" });

export const useDiffStore = create<DiffState>((set, get) => ({
  mode: "paste",
  old: emptyPasteSide("old"),
  new: emptyPasteSide("new"),
  layout: "split",
  themeType: "system",
  lineDiffType: "word",
  wordWrap: false,
  languageOverride: null,
  frozen: false,
  dropTarget: null,
  topPaneHeight: 280,
  recentPairs: [],
  searchQuery: "",
  searchCaseSensitive: false,
  searchActiveId: null,
  expandedHunks: new Map(),
  hydrated: false,

  setMode: (mode) => {
    if (mode === get().mode) return;
    // Keep both sides (text, names, paths) intact so the diff and entered
    // content survive a mode switch. Only new input — typing or loading a
    // file — replaces a side.
    set({ mode });
  },

  setSide: (side, input) => set({ [side]: input } as Pick<DiffState, Side>),

  setText: (side, text) => set((s) => ({ [side]: { ...s[side], text } }) as Pick<DiffState, Side>),

  clearSide: (side) =>
    set({
      [side]: get().mode === "paste" ? emptyPasteSide(side) : emptyFileSide(),
    } as Pick<DiffState, Side>),

  swapSides: () => set((s) => ({ old: s.new, new: s.old })),

  setLayout: (layout) => set({ layout }),
  toggleLayout: () => set((s) => ({ layout: s.layout === "split" ? "unified" : "split" })),

  setThemeType: (themeType) => set({ themeType }),
  setLineDiffType: (lineDiffType) => set({ lineDiffType }),
  setWordWrap: (wordWrap) => set({ wordWrap }),
  toggleWordWrap: () => set((s) => ({ wordWrap: !s.wordWrap })),
  setLanguageOverride: (languageOverride) => set({ languageOverride }),

  setFrozen: (frozen) => set({ frozen }),
  toggleFrozen: () => set((s) => ({ frozen: !s.frozen })),
  setDropTarget: (dropTarget) => set({ dropTarget }),
  setTopPaneHeight: (topPaneHeight) => set({ topPaneHeight }),

  addRecentPair: (pair) =>
    set((s) => {
      const deduped = s.recentPairs.filter(
        (p) => !(p.oldPath === pair.oldPath && p.newPath === pair.newPath),
      );
      return { recentPairs: [pair, ...deduped].slice(0, MAX_RECENTS) };
    }),

  removeRecentPair: (pair) =>
    set((s) => ({
      recentPairs: s.recentPairs.filter(
        (p) => !(p.oldPath === pair.oldPath && p.newPath === pair.newPath),
      ),
    })),

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  toggleSearchCaseSensitive: () => set((s) => ({ searchCaseSensitive: !s.searchCaseSensitive })),
  setSearchActiveId: (searchActiveId) => set({ searchActiveId }),
  setExpandedHunks: (expandedHunks) => set({ expandedHunks }),

  hydrate: (partial) => set({ ...partial, hydrated: true }),
}));
