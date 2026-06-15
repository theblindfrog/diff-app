import { useEffect } from "react";
import { AppShell } from "./app/AppShell";
import { ensureHighlighter } from "./platform/highlighter";
import { usePersistence } from "./app/usePersistence";
import { useDiffStore } from "./store";

function App() {
  const themeType = useDiffStore((s) => s.themeType);

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

  return <AppShell />;
}

export default App;
