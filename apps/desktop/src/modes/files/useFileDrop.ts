import { useEffect, useRef } from "react";
import { useDiffStore } from "../../store";
import { onFileDrop } from "../../platform/dnd";
import { useFileLoader } from "./useFileLoader";
import type { Side } from "../../types";

/** Which side a drop at physical-x targets, based on the window midpoint. */
function sideForX(x: number): Side {
  const mid = (window.innerWidth * window.devicePixelRatio) / 2;
  return x < mid ? "old" : "new";
}

/**
 * Global file drag-and-drop: highlights the hovered side, and on drop switches
 * to Files mode and loads the file(s) — two paths fill both sides, one path
 * loads the side under the cursor. Duplicate drop events are de-duped.
 */
export function useFileDrop() {
  const setMode = useDiffStore((s) => s.setMode);
  const setDropTarget = useDiffStore((s) => s.setDropTarget);
  const { loadSide, loadPair } = useFileLoader();
  const lastDrop = useRef<{ key: string; t: number }>({ key: "", t: 0 });

  useEffect(() => {
    let active = true;
    let unlisten = () => {};

    onFileDrop((e) => {
      if (e.type === "enter" || e.type === "over") {
        setDropTarget(sideForX(e.x));
        return;
      }
      if (e.type === "leave") {
        setDropTarget(null);
        return;
      }
      // drop
      setDropTarget(null);
      const paths = e.paths.filter(Boolean);
      if (paths.length === 0) return;

      const key = paths.join("|");
      const now = Date.now();
      if (lastDrop.current.key === key && now - lastDrop.current.t < 700) return;
      lastDrop.current = { key, t: now };

      setMode("files");
      if (paths.length >= 2) {
        void loadPair([paths[0], paths[1]]);
      } else {
        void loadSide(sideForX(e.x), paths[0]);
      }
    }).then((fn) => {
      if (active) unlisten = fn;
      else fn();
    });

    return () => {
      active = false;
      setDropTarget(null);
      unlisten();
    };
  }, [setMode, setDropTarget, loadSide, loadPair]);
}
