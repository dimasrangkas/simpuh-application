import {
  BarChart3,
  FileText,
  LayoutDashboard,
  Scale as ScaleIcon,
  ScanLine,
  Settings,
  Ship,
  ShoppingCart,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { Role } from '@/types'

export type PageId =
  | 'dashboard-pps'
  | 'weighing'
  | 'morphology'
  | 'reports-pps'
  | 'dashboard-owner'
  | 'tag-abk'
  | 'crew-report'
  | 'ships'
  | 'dashboard-buyer'
  | 'purchase'
  | 'invoices'
  | 'dashboard-admin'
  | 'users'
  | 'scales'
  | 'settings'

export interface NavItem {
  id: PageId
  label: string
  icon: LucideIcon
}

/**
 * Sumber kebenaran tunggal untuk menu DAN hak akses.
 * Menambah halaman cukup di sini — sidebar, guard, dan halaman awal
 * tiap role otomatis ikut menyesuaikan.
 */
export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  PPS_OFFICER: [
    { id: 'dashboard-pps', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'weighing', label: 'Penimbangan', icon: ScaleIcon },
    { id: 'morphology', label: 'Scan Morfologi', icon: ScanLine },
    { id: 'reports-pps', label: 'Laporan', icon: FileText },
  ],
  SHIP_OWNER: [
    { id: 'dashboard-owner', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tag-abk', label: 'Tag ABK', icon: Users },
    { id: 'crew-report', label: 'Laporan ABK', icon: BarChart3 },
    { id: 'ships', label: 'Data Kapal', icon: Ship },
  ],
  BUYER: [
    { id: 'dashboard-buyer', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'purchase', label: 'Pembelian', icon: ShoppingCart },
    { id: 'invoices', label: 'Invoice', icon: FileText },
  ],
  ADMIN: [
    { id: 'dashboard-admin', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Pengguna', icon: Users },
    { id: 'scales', label: 'Timbangan IoT', icon: ScaleIcon },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ],
}

export const ROLE_LABEL: Record<Role, string> = {
  PPS_OFFICER: 'Petugas PPS',
  SHIP_OWNER: 'Pemilik Kapal',
  BUYER: 'Pembeli',
  ADMIN: 'Admin',
}

export const ALL_ROLES: Role[] = ['PPS_OFFICER', 'SHIP_OWNER', 'BUYER', 'ADMIN']

/** Halaman pertama yang dibuka saat masuk / berganti role. */
export function landingPageFor(role: Role): PageId {
  return NAV_BY_ROLE[role][0].id
}

/** Guard: apakah role ini boleh membuka halaman tersebut. */
export function canAccess(role: Role, page: PageId): boolean {
  return NAV_BY_ROLE[role].some((item) => item.id === page)
}
