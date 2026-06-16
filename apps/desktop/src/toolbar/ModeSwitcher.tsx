import { SegmentedControl } from "@radix-ui/themes";
import { useDiffStore } from "../store";
import type { Mode } from "../types";

export function ModeSwitcher() {
  const mode = useDiffStore((s) => s.mode);
  const setMode = useDiffStore((s) => s.setMode);
  return (
    <SegmentedControl.Root
      size="1"
      value={mode}
      onValueChange={(v) => setMode(v as Mode)}
      aria-label="Input mode"
    >
      <SegmentedControl.Item value="files">Files</SegmentedControl.Item>
      <SegmentedControl.Item value="paste">Paste</SegmentedControl.Item>
    </SegmentedControl.Root>
  );
}
