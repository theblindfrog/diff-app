import { useDiffStore } from "../store";

export function WordWrapToggle() {
  const wordWrap = useDiffStore((s) => s.wordWrap);
  const toggleWordWrap = useDiffStore((s) => s.toggleWordWrap);

  return (
    <button
      type="button"
      className={`toolbar-btn${wordWrap ? " on" : ""}`}
      onClick={toggleWordWrap}
      title={
        wordWrap
          ? "Word wrap on — long lines wrap (⇧⌘W)"
          : "Word wrap off — long lines scroll (⇧⌘W)"
      }
    >
      ↵ Wrap
    </button>
  );
}
