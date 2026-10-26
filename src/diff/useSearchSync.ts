import { useCallback, useEffect, useMemo, useRef } from "react";
import type { HunkExpansionRegion } from "@pierre/diffs";
import { useDiffStore } from "../store";
import { useDiffSearch } from "./useDiffSearch";
import { clearHighlights, paintHighlights } from "./searchDom";
import type { SearchMatch } from "./search";

/** The slice of a rendered diff instance we read expansion state from. Its
 * `hunksRenderer` is protected in the typings but is a plain field at runtime;
 * the File (identical sides) view has no such renderer. */
interface ExpandableInstance {
  hunksRenderer?: { getExpandedHunksMap?: () => Map<number, HunkExpansionRegion> };
}

function serialize(map: ReadonlyMap<number, HunkExpansionRegion>): string {
  return [...map].map(([k, r]) => `${k}:${r.fromStart}:${r.fromEnd}`).join(",");
}

/**
 * Keeps find-in-diff in step with the rendered diff:
 * - mirrors the renderer's expanded-context state into the store after every
 *   render, so expanding a folded region makes its lines searchable (and
 *   folding them back hides them again);
 * - repaints match highlights whenever the virtualized window mounts new rows.
 *
 * Returns an `onPostRender` handler for the diff component's options.
 */
export function useSearchSync(diffKey: string) {
  const { matches, activeIndex } = useDiffSearch();
  const setExpandedHunks = useDiffStore((s) => s.setExpandedHunks);
  const lastExpanded = useRef("");
  const observer = useRef<MutationObserver | null>(null);
  const observedRoot = useRef<ShadowRoot | null>(null);
  const frame = useRef(0);

  const byKey = useMemo(() => {
    const map = new Map<string, SearchMatch[]>();
    for (const m of matches) {
      const list = map.get(m.line.key);
      if (list) list.push(m);
      else map.set(m.line.key, [m]);
    }
    return map;
  }, [matches]);
  const active = activeIndex >= 0 ? matches[activeIndex] : null;

  // Latest paint inputs, read by the long-lived MutationObserver callback.
  const paintArgs = useRef({ byKey, active });
  const schedulePaint = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() =>
      paintHighlights(paintArgs.current.byKey, paintArgs.current.active),
    );
  }, []);

  useEffect(() => {
    paintArgs.current = { byKey, active };
    schedulePaint();
  }, [byKey, active, schedulePaint]);

  // A new diff starts fully folded.
  useEffect(() => {
    lastExpanded.current = "";
    setExpandedHunks(new Map());
  }, [diffKey, setExpandedHunks]);

  useEffect(
    () => () => {
      observer.current?.disconnect();
      cancelAnimationFrame(frame.current);
      clearHighlights();
    },
    [],
  );

  return useCallback(
    (node: HTMLElement, instance: unknown) => {
      // The map is mutated in place by the renderer, so compare by value and
      // hand the store a fresh copy only when it actually changed.
      const map = (instance as ExpandableInstance).hunksRenderer?.getExpandedHunksMap?.();
      const key = map ? serialize(map) : "";
      if (key !== lastExpanded.current) {
        lastExpanded.current = key;
        setExpandedHunks(new Map(map));
      }

      // Rows mount and unmount as the user scrolls; watch the shadow tree.
      const root = node.shadowRoot;
      if (root && root !== observedRoot.current) {
        observer.current?.disconnect();
        observer.current = new MutationObserver(schedulePaint);
        observer.current.observe(root, { childList: true, subtree: true });
        observedRoot.current = root;
      }
      schedulePaint();
    },
    [setExpandedHunks, schedulePaint],
  );
}
