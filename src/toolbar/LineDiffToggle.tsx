import { SegmentedControl } from "@radix-ui/themes";
import { useDiffStore } from "../store";
import type { LineDiffType } from "../types";

export function LineDiffToggle() {
  const lineDiffType = useDiffStore((s) => s.lineDiffType);
  const setLineDiffType = useDiffStore((s) => s.setLineDiffType);
  return (
    <SegmentedControl.Root
      size="1"
      value={lineDiffType}
      onValueChange={(v) => setLineDiffType(v as LineDiffType)}
      aria-label="Inline change granularity"
    >
      <SegmentedControl.Item value="word">Word</SegmentedControl.Item>
      <SegmentedControl.Item value="char">Char</SegmentedControl.Item>
    </SegmentedControl.Root>
  );
}
