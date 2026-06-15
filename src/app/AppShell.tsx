import { useCallback, useEffect, useRef } from "react";
import { useDiffStore } from "../store";
import { TopBar } from "./TopBar";
import { PasteMode } from "../modes/paste/PasteMode";
import { FilesMode } from "../modes/files/FilesMode";
import { DiffView } from "../diff/DiffView";
import { ResizeHandle } from "./ResizeHandle";
import { clampTopHeight } from "./paneLayout";
import { useFileDrop } from "../modes/files/useFileDrop";
import { useFileWatch } from "../modes/files/useFileWatch";

export function AppShell() {
  const mode = useDiffStore((s) => s.mode);
  const topPaneHeight = useDiffStore((s) => s.topPaneHeight);
  const setTopPaneHeight = useDiffStore((s) => s.setTopPaneHeight);
  const hydrated = useDiffStore((s) => s.hydrated);
  const inputsRef = useRef<HTMLElement>(null);

  // Global native file drag-and-drop + live re-diff of watched files.
  useFileDrop();
  useFileWatch();

  // Keep the top-area height valid for the current window size.
  const reclamp = useCallback(() => {
    const top = inputsRef.current?.getBoundingClientRect().top ?? 0;
    const current = useDiffStore.getState().topPaneHeight;
    const next = clampTopHeight(current, top);
    if (next !== current) setTopPaneHeight(next);
  }, [setTopPaneHeight]);

  useEffect(() => {
    reclamp();
    window.addEventListener("resize", reclamp);
    return () => window.removeEventListener("resize", reclamp);
  }, [reclamp]);

  // Re-clamp once persisted prefs (which may include a larger height) load.
  useEffect(() => {
    reclamp();
  }, [hydrated, reclamp]);

  return (
    <div className="app-shell">
      <TopBar />
      <section className="mode-content" ref={inputsRef} style={{ height: topPaneHeight }}>
        {mode === "paste" ? <PasteMode /> : <FilesMode />}
      </section>
      <ResizeHandle inputsRef={inputsRef} />
      <DiffView />
    </div>
  );
}
