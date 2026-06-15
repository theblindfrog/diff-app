import { useDiffStore } from "../store";

export function LayoutToggle() {
  const layout = useDiffStore((s) => s.layout);
  const setLayout = useDiffStore((s) => s.setLayout);
  return (
    <div className="segmented" role="group" aria-label="Diff layout">
      <button
        aria-pressed={layout === "split"}
        className={layout === "split" ? "on" : ""}
        onClick={() => setLayout("split")}
        title="Side-by-side"
      >
        Split
      </button>
      <button
        aria-pressed={layout === "unified"}
        className={layout === "unified" ? "on" : ""}
        onClick={() => setLayout("unified")}
        title="Stacked"
      >
        Unified
      </button>
    </div>
  );
}
