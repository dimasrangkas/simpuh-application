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
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELED: 'bg-red-100 text-red-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-green-100 text-green-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
  }
  return map[status] ?? 'bg-gray-100 text-gray-800'
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
  if (score >= 95) return 'text-green-600'
  if (score >= 90) return 'text-blue-600'
  return 'text-amber-600'
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
