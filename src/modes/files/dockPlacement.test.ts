import { describe, expect, it } from "vitest";
import { resolveDockPlacement } from "./dockPlacement";
import type { SideInput } from "../../types";

const empty: SideInput = { text: "", name: "" };
const pastedText: SideInput = { text: "hello", name: "Original" };
const filedPath: SideInput = { text: "content", name: "a.txt", path: "/tmp/a.txt" };
const emptyFileWithPath: SideInput = { text: "", name: "empty.txt", path: "/tmp/empty.txt" };

describe("resolveDockPlacement", () => {
  it("two files always replace both sides, regardless of current state", () => {
    expect(resolveDockPlacement(empty, empty, 2)).toEqual({ kind: "both" });
    expect(resolveDockPlacement(filedPath, filedPath, 2)).toEqual({ kind: "both" });
  });

  it("one file, Original empty: fills Original", () => {
    expect(resolveDockPlacement(empty, empty, 1)).toEqual({ kind: "old" });
    expect(resolveDockPlacement(empty, pastedText, 1)).toEqual({ kind: "old" });
  });

  it("one file, only Original filled: fills Modified", () => {
    expect(resolveDockPlacement(filedPath, empty, 1)).toEqual({ kind: "new" });
    expect(resolveDockPlacement(pastedText, empty, 1)).toEqual({ kind: "new" });
  });

  it("one file, both filled: clears the comparison and loads Original", () => {
    expect(resolveDockPlacement(filedPath, pastedText, 1)).toEqual({ kind: "replace-old" });
  });

  it("an empty file with a path counts as filled", () => {
    expect(resolveDockPlacement(emptyFileWithPath, empty, 1)).toEqual({ kind: "new" });
    expect(resolveDockPlacement(empty, emptyFileWithPath, 1)).toEqual({ kind: "old" });
  });

  it("nonempty pasted text counts as filled even without a path", () => {
    expect(resolveDockPlacement(pastedText, empty, 1)).toEqual({ kind: "new" });
  });
});
