import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDiffStore } from "../../store";
import type { SideInput } from "../../types";

const { readFileMock } = vi.hoisted(() => ({ readFileMock: vi.fn() }));
vi.mock("@tauri-apps/plugin-fs", () => ({ readFile: readFileMock }));

const { showErrorMock } = vi.hoisted(() => ({ showErrorMock: vi.fn() }));
vi.mock("../../platform/dialog", () => ({ showError: showErrorMock }));

const { invokeMock } = vi.hoisted(() => ({ invokeMock: vi.fn() }));
vi.mock("@tauri-apps/api/core", () => ({ invoke: invokeMock }));

vi.mock("@tauri-apps/api/event", () => ({ listen: vi.fn().mockResolvedValue(() => {}) }));

const { applyDockRequest, processPendingOpens, drainPendingOpens } = await import("./dockOpen");

const emptySide: SideInput = { text: "", name: "" };

function resetStore() {
  useDiffStore.setState({ old: emptySide, new: emptySide, mode: "paste", recentPairs: [] });
}

function utf8(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

beforeEach(() => {
  resetStore();
  readFileMock.mockReset();
  showErrorMock.mockReset();
  invokeMock.mockReset();
});

describe("applyDockRequest", () => {
  it("fills Original from an empty comparison and switches to Files mode", async () => {
    readFileMock.mockResolvedValueOnce(utf8("a"));

    await applyDockRequest(["/tmp/a.txt"]);

    const state = useDiffStore.getState();
    expect(state.mode).toBe("files");
    expect(state.old).toMatchObject({ name: "a.txt", path: "/tmp/a.txt", text: "a" });
    expect(state.new).toEqual(emptySide);
  });

  it("rejects more than two files without touching the store", async () => {
    await applyDockRequest(["/tmp/a.txt", "/tmp/b.txt", "/tmp/c.txt"]);

    expect(readFileMock).not.toHaveBeenCalled();
    expect(showErrorMock).toHaveBeenCalledTimes(1);
    expect(useDiffStore.getState().old).toEqual(emptySide);
  });

  it("reads all requested files before updating either side (atomic failure)", async () => {
    readFileMock.mockResolvedValueOnce(utf8("a")).mockRejectedValueOnce(new Error("boom"));

    await applyDockRequest(["/tmp/a.txt", "/tmp/b.txt"]);

    const state = useDiffStore.getState();
    expect(state.old).toEqual(emptySide);
    expect(state.new).toEqual(emptySide);
    expect(showErrorMock).toHaveBeenCalledTimes(1);
  });

  it("rejects a file whose bytes aren't valid UTF-8, without touching the store", async () => {
    // A lone 0xff byte is never valid UTF-8 on its own, in any position.
    readFileMock.mockResolvedValueOnce(new Uint8Array([0xff, 0xfe, 0xc3, 0x28]));

    await applyDockRequest(["/tmp/binary.dat"]);

    expect(useDiffStore.getState().old).toEqual(emptySide);
    expect(showErrorMock).toHaveBeenCalledTimes(1);
  });

  it("records a recent pair once both sides resolve to a path", async () => {
    readFileMock.mockResolvedValueOnce(utf8("a")).mockResolvedValueOnce(utf8("b"));

    await applyDockRequest(["/tmp/a.txt", "/tmp/b.txt"]);

    expect(useDiffStore.getState().recentPairs).toEqual([
      { oldPath: "/tmp/a.txt", newPath: "/tmp/b.txt" },
    ]);
  });
});

describe("processPendingOpens (ordered requests)", () => {
  it("applies each queued request against the state left by the previous one", async () => {
    readFileMock.mockResolvedValueOnce(utf8("a")).mockResolvedValueOnce(utf8("b"));

    await processPendingOpens([["/tmp/a.txt"], ["/tmp/b.txt"]]);

    const state = useDiffStore.getState();
    expect(state.old).toMatchObject({ path: "/tmp/a.txt" });
    expect(state.new).toMatchObject({ path: "/tmp/b.txt" });
  });

  it("a request that lands when both sides are filled clears and reloads Original", async () => {
    readFileMock
      .mockResolvedValueOnce(utf8("a"))
      .mockResolvedValueOnce(utf8("b"))
      .mockResolvedValueOnce(utf8("c"));

    await processPendingOpens([["/tmp/a.txt"], ["/tmp/b.txt"], ["/tmp/c.txt"]]);

    const state = useDiffStore.getState();
    expect(state.old).toMatchObject({ path: "/tmp/c.txt" });
    expect(state.new).toEqual(emptySide);
  });
});

describe("drainPendingOpens (startup queue delivery)", () => {
  it("processes a queued batch exactly once, even when drained concurrently", async () => {
    invokeMock.mockResolvedValueOnce([["/tmp/a.txt"]]).mockResolvedValue([]);
    readFileMock.mockResolvedValueOnce(utf8("a"));

    // Simulates a live "pending" ping racing the post-hydration flush (or a
    // duplicate mount effect under React Strict Mode).
    await Promise.all([drainPendingOpens(), drainPendingOpens()]);

    expect(useDiffStore.getState().old).toMatchObject({ path: "/tmp/a.txt" });
    expect(readFileMock).toHaveBeenCalledTimes(1);
    expect(invokeMock).toHaveBeenCalledTimes(2);
  });
});
