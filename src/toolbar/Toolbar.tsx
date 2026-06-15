import { useMemo } from "react";
import { useDiffStore } from "../store";
import { useDiffModel } from "../diff/useDiffModel";
import { computeStats, useFileDiff } from "../diff/useFileDiff";
import { LayoutToggle } from "./LayoutToggle";
import { WordWrapToggle } from "./WordWrapToggle";
import { LanguagePicker } from "./LanguagePicker";
import { StatsBadge } from "./StatsBadge";
import { ThemeToggle } from "./ThemeToggle";
import { ChangeNavigator } from "./ChangeNavigator";
import { FreezeToggle } from "./FreezeToggle";

export function Toolbar() {
  const { oldFile, newFile, language, hasContent } = useDiffModel();
  const fd = useFileDiff(oldFile, newFile);
  const stats = useMemo(() => computeStats(fd), [fd]);
  const mode = useDiffStore((s) => s.mode);

  return (
    <div className="toolbar">
      <LayoutToggle />
      <WordWrapToggle />
      <LanguagePicker detected={language} />
      <ChangeNavigator count={stats.hunks} />
      <StatsBadge stats={stats} visible={hasContent} />
      <div className="toolbar-spacer" />
      {mode === "files" && <FreezeToggle />}
      <ThemeToggle />
    </div>
  );
}
