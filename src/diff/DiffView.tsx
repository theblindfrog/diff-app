import { useEffect } from "react";
import { MultiFileDiff, Virtualizer, useWorkerPool } from "@pierre/diffs/react";
import { useDiffStore } from "../store";
import { MAX_LINE_DIFF_LENGTH } from "../platform/highlighter";
import { useDiffModel } from "./useDiffModel";

export function DiffView() {
  const { oldFile, newFile, hasContent } = useDiffModel();
  const layout = useDiffStore((s) => s.layout);
  const themeType = useDiffStore((s) => s.themeType);
  const lineDiffType = useDiffStore((s) => s.lineDiffType);
  const wordWrap = useDiffStore((s) => s.wordWrap);

  // The worker pool's lineDiffType is fixed at construction — the React layer
  // never forwards the per-render <MultiFileDiff> option to it — so the Word/
  // Char toggle has to drive it imperatively. setRenderOptions clears the diff
  // caches and re-renders the mounted diff at the new granularity. (We keep the
  // option on MultiFileDiff too, for the on-thread fallback when no pool runs.)
  const pool = useWorkerPool();
  useEffect(() => {
    pool?.setRenderOptions({ lineDiffType, maxLineDiffLength: MAX_LINE_DIFF_LENGTH });
  }, [pool, lineDiffType]);

  if (!hasContent) {
    return (
      <div className="diff-empty">
        <p>No content to compare yet.</p>
        <p className="diff-empty-hint">
          Paste text into both panes, or switch to Files and open two files.
        </p>
      </div>
    );
  }

  // The Virtualizer renders its own scroll container (root + content div) and
  // supplies the context that flips MultiFileDiff onto its virtualized renderer,
  // so only on-screen rows hit the DOM. Without it the whole diff (thousands of
  // rows for large files) renders synchronously and freezes the UI.
  return (
    <Virtualizer className="diff-scroll">
      <MultiFileDiff
        oldFile={oldFile}
        newFile={newFile}
        options={{
          diffStyle: layout,
          theme: { light: "github-light", dark: "github-dark" },
          themeType,
          lineDiffType,
          maxLineDiffLength: MAX_LINE_DIFF_LENGTH,
          overflow: wordWrap ? "wrap" : "scroll",
          stickyHeader: false,
        }}
      />
    </Virtualizer>
  );
}
