import { MultiFileDiff } from "@pierre/diffs/react";
import { useDiffStore } from "../store";
import { useDiffModel } from "./useDiffModel";

export function DiffView() {
  const { oldFile, newFile, hasContent } = useDiffModel();
  const layout = useDiffStore((s) => s.layout);
  const themeType = useDiffStore((s) => s.themeType);

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

  return (
    <div className="diff-scroll">
      <MultiFileDiff
        oldFile={oldFile}
        newFile={newFile}
        options={{
          diffStyle: layout,
          theme: { light: "github-light", dark: "github-dark" },
          themeType,
          lineDiffType: "word",
          overflow: "scroll",
          stickyHeader: false,
        }}
      />
    </div>
  );
}
