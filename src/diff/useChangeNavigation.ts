import { useCallback, useEffect, useRef } from "react";
import type { Hunk } from "@pierre/diffs";
import { useDiffStore } from "../store";
import { scrollToHunk } from "./navigation";

export interface ChangeNavigation {
  next: () => void;
  prev: () => void;
}

/**
 * Drives next/prev change navigation and binds global shortcuts (F8 / Shift+F8
 * and Alt+Down / Alt+Up). Navigation targets the parsed `hunks` directly (the
 * diff is virtualized, so off-screen rows aren't in the DOM); it's a no-op when
 * there are none. Shortcuts are ignored while typing in a field.
 */
export function useChangeNavigation(hunks: Hunk[]): ChangeNavigation {
  const index = useRef(-1);
  const layout = useDiffStore((s) => s.layout);
  const toggleWordWrap = useDiffStore((s) => s.toggleWordWrap);
  const count = hunks.length;

  // Reset position whenever the diff changes shape.
  useEffect(() => {
    index.current = -1;
  }, [count]);

  const next = useCallback(() => {
    if (count === 0) return;
    const target = Math.min((index.current < 0 ? -1 : index.current) + 1, count - 1);
    index.current = scrollToHunk(hunks, target, layout);
  }, [hunks, count, layout]);

  const prev = useCallback(() => {
    if (count === 0) return;
    const target = Math.max((index.current < 0 ? count : index.current) - 1, 0);
    index.current = scrollToHunk(hunks, target, layout);
  }, [hunks, count, layout]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT") return;

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "w") {
        e.preventDefault();
        toggleWordWrap();
      } else if (e.key === "F8") {
        e.preventDefault();
        if (e.shiftKey) prev();
        else next();
      } else if (e.altKey && e.key === "ArrowDown") {
        e.preventDefault();
        next();
      } else if (e.altKey && e.key === "ArrowUp") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, toggleWordWrap]);

  return { next, prev };
}
