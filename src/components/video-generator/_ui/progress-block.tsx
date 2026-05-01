interface ProgressBlockProps {
  completedCount: number;
  total: number;
  failedCount: number;
}
export default function ProgressBlock({
  completedCount,
  total,
  failedCount,
}: ProgressBlockProps) {
  return (
    <div className="p-6 rounded-2xl bg-elevated border border-border relative overflow-hidden">
      <div className="flex justify-between items-end mb-3">
        <div>
          <h4 className="text-(--text-1) font-['Syne'] font-bold text-sm">
            Processing Pipeline
          </h4>
          <p className="text-[11px] text-(--text-3) font-mono mt-1">
            {completedCount} of {total} scenes complete{' '}
            {failedCount > 0 && `(${failedCount} failed)`}
          </p>
        </div>
        <span className="text-primary font-mono text-lg font-bold">
          {Math.round((completedCount / total) * 100)}%
        </span>
      </div>

      <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden border border-border">
        <div
          className="h-full bg-primary transition-all duration-700 ease-out"
          style={{ width: `${(completedCount / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
