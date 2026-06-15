import { useChangeNavigation } from "../diff/useChangeNavigation";

export function ChangeNavigator({ count }: { count: number }) {
  const { next, prev } = useChangeNavigation(count);
  const disabled = count === 0;

  return (
    <div className="navigator" role="group" aria-label="Navigate changes">
      <button
        className="nav-btn"
        disabled={disabled}
        onClick={prev}
        title="Previous change (⇧F8 / ⌥↑)"
        aria-label="Previous change"
      >
        ‹
      </button>
      <span className="nav-count" title={`${count} change region(s)`}>
        {count} {count === 1 ? "change" : "changes"}
      </span>
      <button
        className="nav-btn"
        disabled={disabled}
        onClick={next}
        title="Next change (F8 / ⌥↓)"
        aria-label="Next change"
      >
        ›
      </button>
    </div>
  );
}
