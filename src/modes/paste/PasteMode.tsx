import { EditorPane } from "./EditorPane";

export function PasteMode() {
  return (
    <div className="paste-mode">
      <EditorPane side="old" />
      <EditorPane side="new" />
    </div>
  );
}
