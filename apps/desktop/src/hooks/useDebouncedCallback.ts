import { useCallback, useEffect, useRef } from "react";

/**
 * Returns a stable debounced wrapper around `fn`. The latest `fn` is always
 * called, and any pending invocation is cancelled on unmount.
 */
export function useDebouncedCallback<A extends unknown[]>(
  fn: (...args: A) => void,
  delay: number,
): (...args: A) => void {
  const fnRef = useRef(fn);
  const timer = useRef<number | undefined>(undefined);

  // Keep the ref pointing at the latest `fn` without reading it during render.
  useEffect(() => {
    fnRef.current = fn;
  });

  useEffect(
    () => () => {
      if (timer.current !== undefined) window.clearTimeout(timer.current);
    },
    [],
  );

  return useCallback(
    (...args: A) => {
      if (timer.current !== undefined) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => fnRef.current(...args), delay);
    },
    [delay],
  );
}
