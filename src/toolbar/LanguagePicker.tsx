import { useDiffStore } from "../store";
import { LANGUAGE_OPTIONS } from "../lang/detect";

const AUTO = "__auto";

/** `detected` is the language auto-detection currently resolves to. */
export function LanguagePicker({ detected }: { detected: string }) {
  const override = useDiffStore((s) => s.languageOverride);
  const setOverride = useDiffStore((s) => s.setLanguageOverride);

  return (
    <span className="lang-picker-wrap">
      <select
        className="lang-picker"
        aria-label="Syntax language"
        value={override ?? AUTO}
        onChange={(e) => setOverride(e.target.value === AUTO ? null : e.target.value)}
      >
        <option value={AUTO}>Auto{detected ? ` · ${detected}` : ""}</option>
        {LANGUAGE_OPTIONS.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="lang-picker-chevron" aria-hidden="true" />
    </span>
  );
}
