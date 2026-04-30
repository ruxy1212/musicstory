interface ProgressBlockProps {
  completedCount: number
  total: number
  failedCount: number
}
export default function ProgressBlock({ completedCount, total, failedCount }: ProgressBlockProps) {
  return (
    <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] relative overflow-hidden">
      <div className="flex justify-between items-end mb-3">
        <div>
          <h4 className="text-[var(--text-1)] font-['Syne'] font-bold text-sm">Processing Pipeline</h4>
          <p className="text-[11px] text-[var(--text-3)] font-mono mt-1">
            {completedCount} of {total} scenes complete {failedCount > 0 && `(${failedCount} failed)`}
          </p>
        </div>
        <span className="text-[var(--primary)] font-mono text-lg font-bold">
          {Math.round((completedCount / total) * 100)}%
        </span>
      </div>
      
      <div className="h-1.5 w-full bg-[var(--bg-surface)] rounded-full overflow-hidden border border-[var(--border)]">
        <div
          className="h-full bg-[var(--primary)] transition-all duration-700 ease-out"
          style={{ width: `${(completedCount / total) * 100}%` }}
        />
      </div>
    </div>
  )
}