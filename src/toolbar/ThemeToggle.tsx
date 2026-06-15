import { useDiffStore } from "../store";
import type { ThemeType } from "../types";

const LABELS: Record<ThemeType, string> = {
  system: "Auto",
  light: "Light",
  dark: "Dark",
};

/** Cycles system → light → dark. */
export function ThemeToggle() {
  const themeType = useDiffStore((s) => s.themeType);
  const setThemeType = useDiffStore((s) => s.setThemeType);

  const next: ThemeType =
    themeType === "system" ? "light" : themeType === "light" ? "dark" : "system";

  return (
    <button
      className="toolbar-btn"
      onClick={() => setThemeType(next)}
      title={`Theme: ${LABELS[themeType]} (click for ${LABELS[next]})`}
    >
      {LABELS[themeType]}
    </button>
  );
}
