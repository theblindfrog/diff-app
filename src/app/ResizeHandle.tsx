import { useRef, type RefObject } from "react";
import { useDiffStore } from "../store";
import { clampTopHeight } from "./paneLayout";

/**
 * Draggable divider between the top input area and the diff. Dragging sets the
 * top area's pixel height (clamped); the diff fills the remainder.
 */
export function ResizeHandle({
  inputsRef,
}: {
  inputsRef: RefObject<HTMLElement | null>;
}) {
  const setTopPaneHeight = useDiffStore((s) => s.setTopPaneHeight);
  const dragging = useRef(false);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragging.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Some environments reject capture for non-active pointers; drag still works.
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const top = inputsRef.current?.getBoundingClientRect().top ?? 0;
    setTopPaneHeight(clampTopHeight(e.clientY - top, top));
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div
      className="resize-handle"
      role="separator"
      aria-orientation="horizontal"
      aria-label="Resize inputs and diff"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <span className="resize-handle-grip" />
    </div>
  );
}
