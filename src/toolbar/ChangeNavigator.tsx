import { Flex, IconButton, Text, Tooltip } from "@radix-ui/themes";
import type { Hunk } from "@pierre/diffs";
import { useChangeNavigation } from "../diff/useChangeNavigation";

export function ChangeNavigator({ hunks }: { hunks: Hunk[] }) {
  const { next, prev } = useChangeNavigation(hunks);
  const count = hunks.length;
  const disabled = count === 0;

  return (
    <Flex align="center" gap="1" role="group" aria-label="Navigate changes">
      <Tooltip content="Previous change (⇧F8 / ⌥↑)">
        <IconButton
          size="1"
          variant="surface"
          color="gray"
          disabled={disabled}
          onClick={prev}
          aria-label="Previous change"
        >
          ‹
        </IconButton>
      </Tooltip>
      <Text
        size="1"
        color="gray"
        align="center"
        style={{ minWidth: 70, fontVariantNumeric: "tabular-nums" }}
        title={`${count} change region(s)`}
      >
        {count} {count === 1 ? "change" : "changes"}
      </Text>
      <Tooltip content="Next change (F8 / ⌥↓)">
        <IconButton
          size="1"
          variant="surface"
          color="gray"
          disabled={disabled}
          onClick={next}
          aria-label="Next change"
        >
          ›
        </IconButton>
      </Tooltip>
    </Flex>
  );
}
