import type { LucideIcon } from 'lucide-react'
import { cn } from '@/components/ui/utils'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  hint?: string
  accent?: 'orange' | 'amber' | 'emerald' | 'slate'
  className?: string
}

const ACCENT_CLASSES: Record<NonNullable<StatCardProps['accent']>, string> = {
  orange: 'bg-[#fff3e0] text-[#e64a19]',
  amber: 'bg-amber-50 text-amber-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  slate: 'bg-slate-100 text-slate-700',
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = 'orange',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border/70 bg-card p-4 transition-all',
        'hover:-translate-y-0.5 hover:border-border hover:shadow-[0_12px_28px_-16px_rgba(230,74,25,0.3)]',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-full',
            ACCENT_CLASSES[accent],
          )}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
        </span>
      </div>
      <p className="mt-3 font-dm-sans text-2xl font-semibold leading-none tracking-tight tabular-nums text-foreground">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
