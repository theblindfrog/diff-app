import { useEffect } from "react";
import { useDiffStore } from "../store";
import { loadSettings, saveSettings, type PersistedSettings } from "../platform/persist";

function subset(s: ReturnType<typeof useDiffStore.getState>): PersistedSettings {
  return {
    mode: s.mode,
    layout: s.layout,
    themeType: s.themeType,
    languageOverride: s.languageOverride,
    topPaneHeight: s.topPaneHeight,
    recentPairs: s.recentPairs,
  };
}

/**
 * Loads persisted UI prefs + recents on mount, then writes the persisted subset
 * back whenever it changes (debounced, and only after hydration so defaults
 * don't clobber stored values). Window geometry is handled by the Rust
 * window-state plugin, not here.
 */
export function usePersistence() {
  const hydrate = useDiffStore((s) => s.hydrate);

  useEffect(() => {
    let active = true;
    loadSettings().then((saved) => {
      if (active) hydrate(saved);
    });
    return () => {
      active = false;
    };
  }, [hydrate]);

  useEffect(() => {
    let lastSerialized = "";
    let timer: number | undefined;

    const unsub = useDiffStore.subscribe((state) => {
      if (!state.hydrated) return;
      const next = JSON.stringify(subset(state));
      if (next === lastSerialized) return;
      lastSerialized = next;
      if (timer !== undefined) window.clearTimeout(timer);
      timer = window.setTimeout(() => saveSettings(JSON.parse(next)), 400);
    });

    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
      unsub();
    };
  }, []);
}
