import { useDiffStore } from "../store";

export function FreezeToggle() {
  const frozen = useDiffStore((s) => s.frozen);
  const toggleFrozen = useDiffStore((s) => s.toggleFrozen);

  return (
    <button
      type="button"
      className={`toolbar-btn${frozen ? " on" : ""}`}
      onClick={toggleFrozen}
      title={
        frozen
          ? "Frozen — ignoring on-disk changes (click to go live)"
          : "Live — re-diffs when files change on disk (click to freeze)"
      }
    >
      {frozen ? "❄ Frozen" : "● Live"}
    </button>
  );
}
