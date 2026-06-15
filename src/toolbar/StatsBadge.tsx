import type { DiffStats } from "../diff/useFileDiff";

export function StatsBadge({ stats, visible }: { stats: DiffStats; visible: boolean }) {
  if (!visible) return null;
  if (stats.hunks === 0) {
    return <span className="stats-badge stats-identical">No changes</span>;
  }
  return (
    <span className="stats-badge" title={`${stats.hunks} change region(s)`}>
      <span className="stats-add">+{stats.adds}</span>
      <span className="stats-del">−{stats.dels}</span>
    </span>
  );
}
