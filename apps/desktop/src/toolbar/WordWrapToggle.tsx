import { Button, Tooltip } from "@radix-ui/themes";
import { useDiffStore } from "../store";

export function WordWrapToggle() {
  const wordWrap = useDiffStore((s) => s.wordWrap);
  const toggleWordWrap = useDiffStore((s) => s.toggleWordWrap);

  return (
    <Tooltip
      content={
        wordWrap
          ? "Word wrap on — long lines wrap (⇧⌘W)"
          : "Word wrap off — long lines scroll (⇧⌘W)"
      }
    >
      <Button
        type="button"
        size="1"
        variant={wordWrap ? "solid" : "surface"}
        color={wordWrap ? undefined : "gray"}
        onClick={toggleWordWrap}
        aria-pressed={wordWrap}
      >
        ↵ Wrap
      </Button>
    </Tooltip>
  );
}
