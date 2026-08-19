import type { LucideIcon } from 'lucide-react'
import type * as React from 'react'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'blue',
  hint,
}: {
  label: string
  value: React.ReactNode
  icon: LucideIcon
  tone?: 'blue' | 'green' | 'purple' | 'amber' | 'gray'
  hint?: string
}) {
  const tones = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    gray: 'bg-gray-100 text-gray-600',
  }
  return (
    <Card className="p-5">
      <div className={cn('mb-3 inline-flex rounded-lg p-2', tones[tone])}>
        <Icon className="size-5" />
      </div>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <p className="mt-0.5 text-sm text-gray-500">{label}</p>
      {hint ? <p className="mt-1 text-xs text-gray-400">{hint}</p> : null}
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
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
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
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 px-6 py-12 text-center">
      <Icon className="mb-3 size-8 text-gray-400" />
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p> : null}
    </div>
  )
}
