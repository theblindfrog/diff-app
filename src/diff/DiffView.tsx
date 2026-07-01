import { useEffect } from "react";
import { File, MultiFileDiff, Virtualizer, useWorkerPool } from "@pierre/diffs/react";
import { useDiffStore } from "../store";
import { MAX_LINE_DIFF_LENGTH } from "../platform/highlighter";
import { useDiffModel } from "./useDiffModel";
import { useFileDiff, computeStats } from "./useFileDiff";

/**
 * A content-identity key for the rendered diff: any change to either side yields
 * a new value. It's used to remount <MultiFileDiff> so it renders with a fresh,
 * empty render cache.
 *
 * Why remount at all: the two panes commit to the store in separate updates, so
 * there's always a moment where the old side is set but the new side is still
 * empty. @pierre/diffs highlights that intermediate (all-deletions) diff and
 * marks its cache `highlighted`; its refresh guard then blocks recompute when
 * the real diff arrives, so the Modified side stays an empty placeholder forever
 * (only on the virtualized render path). A fresh key sidesteps the stale cache.
 *
 * djb2 over both sides — length prefixes keep same-hash different-length inputs
 * distinct. Runs at most ~once per paste (store writes are debounced).
 */
function diffKey(a: string, b: string): string {
  let h = 5381;
  const s = `${a} ${b}`;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return `${a.length}:${b.length}:${h}`;
}

export function DiffView() {
  const { oldFile, newFile, hasContent } = useDiffModel();
  const layout = useDiffStore((s) => s.layout);
  const themeType = useDiffStore((s) => s.themeType);
  const lineDiffType = useDiffStore((s) => s.lineDiffType);
  const wordWrap = useDiffStore((s) => s.wordWrap);

  // When the two sides are identical the diff has zero hunks (and zero rendered
  // lines), so <MultiFileDiff> would show an empty body. Detect that and render
  // the content plainly instead. Reuses the same cached parse the toolbar uses.
  const noChanges = computeStats(useFileDiff(oldFile, newFile)).hunks === 0;

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
      {noChanges ? (
        // Identical sides: show the content read-only, syntax-highlighted but
        // with no add/del diff coloring, instead of an empty diff body.
        <File
          key={diffKey(oldFile.contents, newFile.contents)}
          file={newFile}
          options={{
            theme: { light: "github-light", dark: "github-dark" },
            themeType,
            overflow: wordWrap ? "wrap" : "scroll",
            disableFileHeader: true,
          }}
        />
      ) : (
        <MultiFileDiff
          key={diffKey(oldFile.contents, newFile.contents)}
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
      )}
    </Virtualizer>
  );
}
