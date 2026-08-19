import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

import { cn } from '@/lib/utils'

/** Pill dengan titik warna di depan, mengikuti sistem desain acuan. */
const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/15 text-[#b4762f]',
        destructive: 'bg-danger/10 text-danger',
        /** Badge akurasi AI. */
        ai: 'bg-accent/12 text-secondary',
        secondary: 'bg-[#f1f5f8] text-low',
        outline: 'border border-border text-mid',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

const DOT_COLOR = {
  default: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-danger',
  ai: 'bg-accent',
  secondary: 'bg-low',
  outline: 'bg-mid',
} as const

export interface BadgeProps
  extends React.ComponentProps<'span'>,
    VariantProps<typeof badgeVariants> {
  /** Sembunyikan titik warna, mis. saat isinya sudah berupa ikon. */
  dot?: boolean
}

export function Badge({ className, variant, dot = true, children, ...props }: BadgeProps) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot ? (
        <i className={cn('size-1.5 shrink-0 rounded-full', DOT_COLOR[variant ?? 'default'])} />
      ) : null}
      {children}
    </span>
  )
}

export { badgeVariants }
