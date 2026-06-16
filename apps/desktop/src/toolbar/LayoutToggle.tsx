import { SegmentedControl } from "@radix-ui/themes";
import { useDiffStore } from "../store";
import type { Layout } from "../types";

export function LayoutToggle() {
  const layout = useDiffStore((s) => s.layout);
  const setLayout = useDiffStore((s) => s.setLayout);
  return (
    <SegmentedControl.Root
      size="1"
      value={layout}
      onValueChange={(v) => setLayout(v as Layout)}
      aria-label="Diff layout"
    >
      <SegmentedControl.Item value="split">Split</SegmentedControl.Item>
      <SegmentedControl.Item value="unified">Unified</SegmentedControl.Item>
    </SegmentedControl.Root>
  );
}
