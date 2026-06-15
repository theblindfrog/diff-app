import { Select } from "@radix-ui/themes";
import { useDiffStore } from "../store";
import { LANGUAGE_OPTIONS } from "../lang/detect";

const AUTO = "__auto";

/** `detected` is the language auto-detection currently resolves to. */
export function LanguagePicker({ detected }: { detected: string }) {
  const override = useDiffStore((s) => s.languageOverride);
  const setOverride = useDiffStore((s) => s.setLanguageOverride);

  return (
    <Select.Root
      size="1"
      value={override ?? AUTO}
      onValueChange={(v) => setOverride(v === AUTO ? null : v)}
    >
      <Select.Trigger variant="surface" aria-label="Syntax language" />
      <Select.Content position="popper">
        <Select.Item value={AUTO}>Auto{detected ? ` · ${detected}` : ""}</Select.Item>
        {LANGUAGE_OPTIONS.map((o) => (
          <Select.Item key={o.id} value={o.id}>
            {o.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
}
