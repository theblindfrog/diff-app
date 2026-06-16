import { useDiffStore } from "../../store";
import { basename } from "../../platform/env";
import { useFileLoader } from "./useFileLoader";

export function RecentsList() {
  const recents = useDiffStore((s) => s.recentPairs);
  const removeRecentPair = useDiffStore((s) => s.removeRecentPair);
  const { loadPair } = useFileLoader();

  if (recents.length === 0) return null;

  return (
    <div className="recents">
      <div className="recents-title">Recent pairs</div>
      <ul className="recents-list">
        {recents.map((p) => (
          <li key={`${p.oldPath}|${p.newPath}`} className="recents-item">
            <button
              type="button"
              className="recents-open"
              title={`${p.oldPath}\n→ ${p.newPath}`}
              onClick={() => loadPair([p.oldPath, p.newPath])}
            >
              <span className="recents-name">{basename(p.oldPath)}</span>
              <span className="recents-arrow">→</span>
              <span className="recents-name">{basename(p.newPath)}</span>
            </button>
            <button
              type="button"
              className="recents-remove"
              aria-label="Remove from recents"
              onClick={() => removeRecentPair(p)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
