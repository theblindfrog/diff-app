import { useEffect } from "react";
import { Theme } from "@radix-ui/themes";
import { AppShell } from "./app/AppShell";
import { ensureHighlighter } from "./platform/highlighter";
import { usePersistence } from "./app/usePersistence";
import { useEffectiveAppearance } from "./theme/useEffectiveAppearance";
import { useDiffStore } from "./store";

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
      <AppShell />
    </Theme>
  );
}

export default App;
