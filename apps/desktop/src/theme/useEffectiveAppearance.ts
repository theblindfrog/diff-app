import { useSyncExternalStore } from "react";
import { useDiffStore } from "../store";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(DARK_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(DARK_QUERY).matches;
}

/**
 * Resolves the store's `themeType` to a concrete `"light" | "dark"` for Radix's
 * `<Theme appearance>` (which has no "auto"). For "system" we track the OS
 * preference, mirroring the `data-theme` logic in App.tsx so the kit and the
 * @pierre/diffs body stay in lockstep.
 */
export function useEffectiveAppearance(): "light" | "dark" {
  const themeType = useDiffStore((s) => s.themeType);
  const systemDark = useSyncExternalStore(subscribe, getSnapshot);

  if (themeType === "light") return "light";
  if (themeType === "dark") return "dark";
  return systemDark ? "dark" : "light";
}
