import { create } from "zustand";
import type { Layout, Mode, RecentPair, Side, SideInput, ThemeType } from "../types";

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
  /** null = auto-detect from filename; otherwise a Shiki language id. */
  languageOverride: string | null;
  /** Files mode: when true, on-disk changes are ignored (kept watching). */
  frozen: boolean;
  /** Side currently highlighted as a drag-and-drop target, if any. */
  dropTarget: Side | null;
  /** Height (px) of the top input area; the diff fills the rest. Resizable. */
  topPaneHeight: number;
  recentPairs: RecentPair[];
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
  setLanguageOverride: (lang: string | null) => void;
  setFrozen: (frozen: boolean) => void;
  toggleFrozen: () => void;
  setDropTarget: (side: Side | null) => void;
  setTopPaneHeight: (height: number) => void;
  addRecentPair: (pair: RecentPair) => void;
  removeRecentPair: (pair: RecentPair) => void;
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
  languageOverride: null,
  frozen: false,
  dropTarget: null,
  topPaneHeight: 280,
  recentPairs: [],
  hydrated: false,

  setMode: (mode) => {
    if (mode === get().mode) return;
    // Reset both sides to that mode's empty shape so stale content/paths don't leak.
    set(
      mode === "paste"
        ? { mode, old: emptyPasteSide("old"), new: emptyPasteSide("new"), frozen: false }
        : { mode, old: emptyFileSide(), new: emptyFileSide(), frozen: false },
    );
  },

  setSide: (side, input) => set({ [side]: input } as Pick<DiffState, Side>),

  setText: (side, text) =>
    set((s) => ({ [side]: { ...s[side], text } } as Pick<DiffState, Side>)),

  clearSide: (side) =>
    set({
      [side]: get().mode === "paste" ? emptyPasteSide(side) : emptyFileSide(),
    } as Pick<DiffState, Side>),

  swapSides: () => set((s) => ({ old: s.new, new: s.old })),

  setLayout: (layout) => set({ layout }),
  toggleLayout: () => set((s) => ({ layout: s.layout === "split" ? "unified" : "split" })),

  setThemeType: (themeType) => set({ themeType }),
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

  hydrate: (partial) => set({ ...partial, hydrated: true }),
}));
