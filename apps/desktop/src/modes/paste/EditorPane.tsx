import { useEffect, useRef, useState } from "react";
import { useDiffStore, PASTE_NAMES } from "../../store";
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback";
import type { Side } from "../../types";

const PLACEHOLDER: Record<Side, string> = {
  old: "Paste the original text…",
  new: "Paste the modified text…",
};

/**
 * A live-editable pane. Typing is reflected locally for responsiveness and
 * committed to the store (which re-diffs) ~200ms after you stop. External
 * resets (clear/swap/mode change) sync back into the local value.
 */
export function EditorPane({ side }: { side: Side }) {
  const storeText = useDiffStore((s) => s[side].text);
  const setText = useDiffStore((s) => s.setText);

  const [local, setLocal] = useState(storeText);
  const lastCommitted = useRef(storeText);

  useEffect(() => {
    if (storeText !== lastCommitted.current) {
      setLocal(storeText);
      lastCommitted.current = storeText;
    }
  }, [storeText]);

  const commit = useDebouncedCallback((value: string) => {
    lastCommitted.current = value;
    setText(side, value);
  }, 200);

  return (
    <div className="editor-pane">
      <div className="editor-pane-header">{PASTE_NAMES[side]}</div>
      <textarea
        className="editor-pane-input"
        value={local}
        spellCheck={false}
        placeholder={PLACEHOLDER[side]}
        onChange={(e) => {
          const value = e.target.value;
          setLocal(value);
          commit(value);
        }}
      />
    </div>
  );
}
