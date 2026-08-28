// PMG default tag/kill levels are close to 4 and 8 (SpamAssassin score,
// unbounded). Not fixed by CLAUDE.md - revisit if the PMG install uses
// custom thresholds.
const LOW_MAX = 4;
const MEDIUM_MAX = 7;

function levelFor(score) {
  if (score >= MEDIUM_MAX) return 'high';
  if (score >= LOW_MAX) return 'medium';
  return 'low';
}

const STYLES = {
  low: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
  high: 'bg-red-500/10 text-red-400 ring-red-500/20',
};

export default function SpamScoreBadge({ score }) {
  const level = levelFor(score);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-xs font-medium ring-1 ring-inset ${STYLES[level]}`}
    >
      {Number(score).toFixed(1)}
    </span>
  );
}
