import { useEffect } from "react";
import { Theme } from "@radix-ui/themes";
import { WorkerPoolContextProvider } from "@pierre/diffs/react";
import { AppShell } from "./app/AppShell";
import { ensureHighlighter, THEMES, PRELOAD_LANGS } from "./platform/highlighter";
import { createDiffWorker } from "./platform/diffWorker";
import { usePersistence } from "./app/usePersistence";
import { useEffectiveAppearance } from "./theme/useEffectiveAppearance";
import { useDiffStore } from "./store";

// Stable across renders so the worker pool is created once, not torn down and
// rebuilt. The pool offloads Shiki highlighting + word-diff off the main thread
// so large files don't freeze the UI; 2 workers is plenty for a 2-pane viewer.
const POOL_OPTIONS = { workerFactory: createDiffWorker, poolSize: 2 };
const HIGHLIGHTER_OPTIONS = { themes: THEMES, langs: PRELOAD_LANGS };

function App() {
  const themeType = useDiffStore((s) => s.themeType);
  const appearance = useEffectiveAppearance();

  usePersistence();

  useEffect(() => {
    ensureHighlighter();
  }, []);

  // Forced light/dark sets a root attribute the chrome CSS reads; "system"
  // falls back to prefers-color-scheme.
  useEffect(() => {
    const root = document.documentElement;
    if (themeType === "system") {
      delete root.dataset.theme;
    } else {
      root.dataset.theme = themeType;
    }
  }, [themeType]);

  // `hasBackground={false}` keeps the body's own `--bg` showing through; Radix
  // only owns the controls, not the page surface. Accent/gray are tuned to the
  // GitHub-like palette and bridged to the chrome tokens in chrome.css.
  return (
    <Theme
      appearance={appearance}
      accentColor="blue"
      grayColor="slate"
      radius="medium"
      panelBackground="solid"
      hasBackground={false}
    >
      <WorkerPoolContextProvider
        poolOptions={POOL_OPTIONS}
        highlighterOptions={HIGHLIGHTER_OPTIONS}
      >
        <AppShell />
      </WorkerPoolContextProvider>
    </Theme>
  );
}

export default App;
