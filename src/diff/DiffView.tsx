import { MultiFileDiff, Virtualizer } from "@pierre/diffs/react";
import { useDiffStore } from "../store";
import { useDiffModel } from "./useDiffModel";

export function DiffView() {
  const { oldFile, newFile, hasContent } = useDiffModel();
  const layout = useDiffStore((s) => s.layout);
  const themeType = useDiffStore((s) => s.themeType);
  const wordWrap = useDiffStore((s) => s.wordWrap);

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
          lineDiffType: "word",
          overflow: wordWrap ? "wrap" : "scroll",
          stickyHeader: false,
        }}
      />
    </Virtualizer>
  );
}
