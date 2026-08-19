import type { AnyStatus, CrewTagColor } from '@/types'

export function formatIDR(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatKg(value: number) {
  return `${value.toFixed(2)} Kg`
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID').format(value)
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(iso))
}

export function statusColor(status: AnyStatus | string) {
  const map: Record<string, string> = {
    IN_PROGRESS: 'bg-primary/10 text-secondary',
    COMPLETED: 'bg-success/10 text-success',
    CANCELED: 'bg-danger/10 text-danger',
    PENDING: 'bg-warning/15 text-[#b4762f]',
    PAID: 'bg-success/10 text-success',
    CONFIRMED: 'bg-primary/10 text-secondary',
  }
  return map[status] ?? 'bg-bg text-hi'
}

export function statusLabel(status: AnyStatus | string) {
  const map: Record<string, string> = {
    IN_PROGRESS: 'Dalam Proses',
    COMPLETED: 'Selesai',
    CANCELED: 'Dibatalkan',
    PENDING: 'Menunggu',
    PAID: 'Lunas',
    CONFIRMED: 'Dikonfirmasi',
  }
  return map[status] ?? status
}

export function confidenceColor(score: number) {
  if (score >= 95) return 'text-success'
  if (score >= 90) return 'text-primary'
  return 'text-warning'
}

export const CREW_TAG_COLORS: { value: CrewTagColor; label: string; color: string }[] = [
  { value: 'Merah', label: 'Merah 🔴', color: '#ef4444' },
  { value: 'Biru', label: 'Biru 🔵', color: '#3b82f6' },
  { value: 'Hijau', label: 'Hijau 🟢', color: '#22c55e' },
  { value: 'Kuning', label: 'Kuning 🟡', color: '#eab308' },
  { value: 'Putih', label: 'Putih ⚪', color: '#e5e7eb' },
  { value: 'Hitam', label: 'Hitam ⚫', color: '#1f2937' },
  { value: 'Oranye', label: 'Oranye 🟠', color: '#f97316' },
  { value: 'Ungu', label: 'Ungu 🟣', color: '#a855f7' },
]

export function crewTagHex(color: CrewTagColor) {
  return CREW_TAG_COLORS.find((c) => c.value === color)?.color ?? '#9ca3af'
}
