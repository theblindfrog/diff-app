import { Button, Tooltip } from "@radix-ui/themes";
import { useDiffStore } from "../store";

export function FreezeToggle() {
  const frozen = useDiffStore((s) => s.frozen);
  const toggleFrozen = useDiffStore((s) => s.toggleFrozen);

  return (
    <Tooltip
      content={
        frozen
          ? "Frozen — ignoring on-disk changes (click to go live)"
          : "Live — re-diffs when files change on disk (click to freeze)"
      }
    >
      <Button
        type="button"
        size="1"
        variant={frozen ? "solid" : "surface"}
        color={frozen ? undefined : "gray"}
        onClick={toggleFrozen}
        aria-pressed={frozen}
      >
        {frozen ? "❄ Frozen" : "● Live"}
      </Button>
    </Tooltip>
  );
}
