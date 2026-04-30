import { RenderProgress } from "@/types"

interface ComposingBlockProps {
  progress: number
  error: string | null
  status: RenderProgress | null
}

export default function ComposingBlock({ progress, error, status }: ComposingBlockProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-8 animate-fade-up">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-[var(--border)]" />
        <div 
          className="absolute inset-0 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin-smooth"
          style={{ borderRightColor: 'transparent' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[var(--primary)] font-mono text-xl font-bold">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-xl font-['Syne'] font-bold text-[var(--text-1)] tracking-tight">
          Composing Masterpiece
        </h3>
        <p className="text-sm text-[var(--text-3)] font-mono uppercase tracking-[0.2em]">
          Phase: {status?.stage ?? 'Preparing...'}
        </p>
      </div>

      <div className="w-full max-w-md space-y-2">
          <div className="h-1.5 w-full bg-[var(--bg-elevated)] rounded-full overflow-hidden border border-[var(--border)]">
          <div 
            className="h-full bg-[var(--primary)] transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
        {error && (
          <div className="p-4 rounded-lg bg-[var(--error)] bg-opacity-10 border border-[var(--error)] border-opacity-20 text-[var(--error)] text-xs font-mono text-center">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  )
}