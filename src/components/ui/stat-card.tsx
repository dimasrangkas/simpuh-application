import type { LucideIcon } from 'lucide-react'
import type * as React from 'react'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const TONES = {
  primary: 'bg-primary/8 text-primary',
  accent: 'bg-accent/10 text-accent',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/10 text-danger',
  muted: 'bg-bg text-mid',
} as const

export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  tone = 'primary',
  hint,
}: {
  label: string
  value: React.ReactNode
  /** Satuan kecil di samping angka, mis. "Kg". */
  unit?: string
  icon: LucideIcon
  tone?: keyof typeof TONES
  hint?: string
}) {
  return (
    <Card className="px-[18px] pt-[18px] pb-4">
      <div className={cn('flex size-[38px] items-center justify-center rounded-[11px]', TONES[tone])}>
        <Icon className="size-[18px]" />
      </div>
      <p className="mt-3.5 text-xs font-semibold text-mid">{label}</p>
      <p className="tabular mt-0.5 text-[25px] leading-tight font-extrabold tracking-tight text-hi">
        {value}
        {unit ? <small className="ml-1 text-[12.5px] font-medium text-low">{unit}</small> : null}
      </p>
      {hint ? <p className="mt-1.5 text-[11px] text-low">{hint}</p> : null}
    </Card>
  )
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-2.5">
      <div>
        <h1 className="text-[23px] leading-tight font-extrabold tracking-tight text-hi">{title}</h1>
        {description ? <p className="mt-1 text-[13px] text-mid">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

/** Label pemisah antar bagian, dengan garis gradien seperti sistem desain acuan. */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-8 mb-3 flex items-center gap-2.5 text-[11px] font-bold tracking-[1.2px] text-secondary uppercase">
      {children}
      <span className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
    </div>
  )
}

/** Indikator koneksi langsung — dipakai status timbangan IoT. */
export function LivePill({
  children,
  tone = 'success',
}: {
  children: React.ReactNode
  tone?: 'success' | 'warning' | 'danger'
}) {
  const tones = {
    success: 'text-success bg-success/8 border-success/25',
    warning: 'text-warning bg-warning/10 border-warning/30',
    danger: 'text-danger bg-danger/8 border-danger/25',
  }
  const dots = { success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger' }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-[7px] rounded-full border px-3 py-1.5 text-[11px] font-semibold',
        tones[tone],
      )}
    >
      <span className={cn('size-[7px] animate-pulse-dot rounded-full', dots[tone])} />
      {children}
    </span>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border px-6 py-12 text-center">
      <Icon className="mb-3 size-8 text-low" />
      <p className="text-[13px] font-semibold text-mid">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-xs text-low">{description}</p> : null}
    </div>
  )
}
