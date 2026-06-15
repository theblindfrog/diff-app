import { useDiffStore } from "../store";

export function ModeSwitcher() {
  const mode = useDiffStore((s) => s.mode);
  const setMode = useDiffStore((s) => s.setMode);
  return (
    <div className="segmented" role="tablist" aria-label="Input mode">
      <button
        role="tab"
        aria-selected={mode === "files"}
        className={mode === "files" ? "on" : ""}
        onClick={() => setMode("files")}
      >
        Files
      </button>
      <button
        role="tab"
        aria-selected={mode === "paste"}
        className={mode === "paste" ? "on" : ""}
        onClick={() => setMode("paste")}
      >
        Paste
      </button>
    </div>
  );
}
