import { useMemo } from "react";
import type { FileContents } from "@pierre/diffs";
import { useDiffStore } from "../store";
import { effectiveLanguage } from "../lang/detect";

export interface DiffModel {
  oldFile: FileContents;
  newFile: FileContents;
  language: string;
  hasContent: boolean;
}

/**
 * Builds the memoized FileContents pair fed to both the renderer and the
 * metadata parse, so the two never disagree. The effective language (manual
 * override or auto-detected) is applied explicitly to both sides.
 */
export function useDiffModel(): DiffModel {
  const old = useDiffStore((s) => s.old);
  const next = useDiffStore((s) => s.new);
  const languageOverride = useDiffStore((s) => s.languageOverride);

  const language = effectiveLanguage(languageOverride, next.name, old.name);

  const oldFile = useMemo<FileContents>(
    () => ({ name: old.name || "original", contents: old.text, lang: language }),
    [old.name, old.text, language],
  );
  const newFile = useMemo<FileContents>(
    () => ({ name: next.name || "modified", contents: next.text, lang: language }),
    [next.name, next.text, language],
  );

  return {
    oldFile,
    newFile,
    language,
    hasContent: old.text.length > 0 || next.text.length > 0,
  };
}
