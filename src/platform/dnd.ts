import { getCurrentWebview } from "@tauri-apps/api/webview";
import { isTauri } from "./env";

export interface FileDropEvent {
  type: "enter" | "over" | "drop" | "leave";
  paths: string[];
  /** Pointer position in physical pixels (Tauri), or 0 when unavailable. */
  x: number;
  y: number;
}

/**
 * Subscribes to native OS file drag-and-drop on the window. Because
 * `dragDropEnabled` is true, the OS intercepts drops before the DOM, so this
 * (not HTML5 ondrop) is how we get real filesystem paths. No-ops outside Tauri.
 */
export async function onFileDrop(
  handler: (e: FileDropEvent) => void,
): Promise<() => void> {
  if (!isTauri) return () => {};
  return getCurrentWebview().onDragDropEvent((event) => {
    const p = event.payload as {
      type: FileDropEvent["type"];
      paths?: string[];
      position?: { x: number; y: number };
    };
    handler({
      type: p.type,
      paths: p.paths ?? [],
      x: p.position?.x ?? 0,
      y: p.position?.y ?? 0,
    });
  });
}
