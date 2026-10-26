import { describe, expect, it } from "vitest";
import { parseDiffFromFile } from "@pierre/diffs";
import type { FileDiffMetadata, HunkExpansionRegion } from "@pierre/diffs";
// Not part of the package's public exports; imported by path purely as a test
// oracle so our visible-line walk can't drift from the renderer's own.
import { iterateOverDiff } from "../../node_modules/@pierre/diffs/dist/utils/iterateOverDiff.js";
import { findMatches, plainFileLines, visibleDiffLines } from "./search";

const lines = (n: number, f: (i: number) => string) => Array.from({ length: n }, (_, i) => f(i));

function diffOf(oldText: string, newText: string): FileDiffMetadata {
  return parseDiffFromFile(
    { name: "a.txt", contents: oldText, lang: "text" },
    { name: "a.txt", contents: newText, lang: "text" },
  );
}

/** Row keys the renderer itself would emit, per side. */
function oracleKeys(fd: FileDiffMetadata, expanded: Map<number, HunkExpansionRegion>) {
  const keys: string[] = [];
  iterateOverDiff({
    diff: fd,
    diffStyle: "both",
    expandedHunks: expanded,
    callback: (p) => {
      if (p.type === "change") {
        if (p.deletionLine && !p.additionLine) {
          const d = p.deletionLine;
          keys.push(`deletion ${d.unifiedLineIndex},${d.splitLineIndex}`);
        } else if (p.additionLine && !p.deletionLine) {
          const a = p.additionLine;
          keys.push(`addition ${a.unifiedLineIndex},${a.splitLineIndex}`);
        } else {
          const d = p.deletionLine!;
          const a = p.additionLine!;
          keys.push(`deletion ${d.unifiedLineIndex},${d.splitLineIndex}`);
          keys.push(`addition ${a.unifiedLineIndex},${a.splitLineIndex}`);
        }
      } else {
        const a = p.additionLine;
        keys.push(`context ${a.unifiedLineIndex},${a.splitLineIndex}`);
      }
    },
  });
  return keys.sort();
}

const ours = (fd: FileDiffMetadata, expanded: Map<number, HunkExpansionRegion>) =>
  visibleDiffLines(fd, expanded)
    .map((l) => `${l.side} ${l.key}`)
    .sort();

const OLD = lines(80, (i) => `line ${i} foo`).join("\n") + "\n";
const NEW = OLD.replace("line 5 foo", "line 5 bar\nline 5b new")
  .replace("line 40 foo\n", "")
  .replace("line 70 foo", "line 70 baz");

describe("visibleDiffLines", () => {
  it("matches the renderer's rows when everything is folded", () => {
    const fd = diffOf(OLD, NEW);
    expect(ours(fd, new Map())).toEqual(oracleKeys(fd, new Map()));
  });

  it("matches the renderer's rows with partially and fully expanded gaps", () => {
    const fd = diffOf(OLD, NEW);
    const expanded = new Map<number, HunkExpansionRegion>([
      [1, { fromStart: 3, fromEnd: 2 }],
      [2, { fromStart: 100, fromEnd: 0 }],
      [fd.hunks.length, { fromStart: 2, fromEnd: 0 }],
    ]);
    expect(ours(fd, expanded)).toEqual(oracleKeys(fd, expanded));
  });

  it("carries the line text without terminators", () => {
    const fd = diffOf(OLD, NEW);
    const texts = visibleDiffLines(fd, new Map()).map((l) => l.text);
    expect(texts).toContain("line 5 bar");
    expect(texts).toContain("line 5 foo");
    expect(texts.every((t) => !t.endsWith("\n"))).toBe(true);
  });
});

describe("findMatches", () => {
  it("does not return text inside folded regions", () => {
    const fd = diffOf(OLD, NEW);
    // "line 20" sits in the middle of a folded gap.
    expect(findMatches(visibleDiffLines(fd, new Map()), "line 20 ", false, "split")).toEqual([]);
    const expanded = new Map([[1, { fromStart: 100, fromEnd: 0 }]]);
    const hits = findMatches(visibleDiffLines(fd, expanded), "line 20 ", false, "split");
    expect(hits).toHaveLength(1);
    expect(hits[0].line.side).toBe("context");
  });

  it("finds every occurrence, case-insensitively by default", () => {
    const visible = plainFileLines("Foo foo\nbar\nFOO");
    expect(findMatches(visible, "foo", false, "unified").map((m) => [m.line.key, m.start])).toEqual(
      [
        ["0", 0],
        ["0", 4],
        ["2", 0],
      ],
    );
    expect(findMatches(visible, "foo", true, "unified")).toHaveLength(1);
  });

  it("orders split-view matches left column first within a row", () => {
    const fd = diffOf("a x\n", "b x\n");
    const order = findMatches(visibleDiffLines(fd, new Map()), "x", false, "split").map(
      (m) => m.line.side,
    );
    expect(order).toEqual(["deletion", "addition"]);
  });

  it("returns nothing for an empty query", () => {
    expect(findMatches(plainFileLines("abc"), "", false, "split")).toEqual([]);
  });
});
