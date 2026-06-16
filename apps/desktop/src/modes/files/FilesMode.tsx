import { useDiffStore } from "../../store";
import { FileDropZone } from "./FileDropZone";
import { RecentsList } from "./RecentsList";

export function FilesMode() {
  const swapSides = useDiffStore((s) => s.swapSides);
  const hasAny = useDiffStore((s) => Boolean(s.old.path || s.new.path));

  return (
    <div className="files-mode">
      <div className="files-row">
        <FileDropZone side="old" />
        <button
          type="button"
          className="swap-btn"
          onClick={swapSides}
          disabled={!hasAny}
          title="Swap sides"
          aria-label="Swap sides"
        >
          ⇄
        </button>
        <FileDropZone side="new" />
      </div>
      <RecentsList />
    </div>
  );
}
