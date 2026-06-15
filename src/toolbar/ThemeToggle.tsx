import { Button, Tooltip } from "@radix-ui/themes";
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
    <Tooltip content={`Theme: ${LABELS[themeType]} (click for ${LABELS[next]})`}>
      <Button size="1" variant="surface" color="gray" onClick={() => setThemeType(next)}>
        {LABELS[themeType]}
      </Button>
    </Tooltip>
  );
}
