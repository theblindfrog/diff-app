import { useDiffStore } from "../../store";
import { pickFile } from "../../platform/dialog";
import { isTauri } from "../../platform/env";
import { useFileLoader } from "./useFileLoader";
import type { Side } from "../../types";

const LABEL: Record<Side, string> = { old: "Original", new: "Modified" };

export function FileDropZone({ side }: { side: Side }) {
  const sideData = useDiffStore((s) => s[side]);
  const clearSide = useDiffStore((s) => s.clearSide);
  const dropTarget = useDiffStore((s) => s.dropTarget);
  const { loadSide } = useFileLoader();

  const onPick = async () => {
    try {
      const path = await pickFile();
      if (path) await loadSide(side, path);
    } catch (err) {
      console.error("Failed to open file", err);
    }
  };

  const loaded = Boolean(sideData.path);
  const highlighted = dropTarget === side;

  return (
    <button
      type="button"
      className={`drop-zone${highlighted ? " drop-over" : ""}`}
      onClick={onPick}
      data-drop-side={side}
    >
      <div className="drop-zone-label">{LABEL[side]}</div>
      {loaded ? (
        <div className="drop-zone-file">
          <span className="drop-zone-name" title={sideData.path}>
            {sideData.name}
          </span>
          <span
            className="drop-zone-clear"
            role="button"
            aria-label="Clear file"
            onClick={(e) => {
              e.stopPropagation();
              clearSide(side);
            }}
          >
            ×
          </span>
        </div>
      ) : (
        <div className="drop-zone-empty">
          {isTauri ? "Click to open, or drop a file here" : "Open via the desktop app"}
        </div>
      )}
    </button>
  );
}
