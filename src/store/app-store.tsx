import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import { DEFAULT_CONFIG, calculateHandlingFee, type AppConfig } from '@/data/config'
import {
  CREWS,
  FISH_CATEGORIES,
  LANDINGS,
  SCALES,
  SHIPS,
  USERS,
  WEIGHING_RECORDS,
} from '@/data/mock'
import type {
  Crew,
  FishCategory,
  Invoice,
  Landing,
  MorphologyScan,
  Scale,
  Ship,
  User,
  WeighingRecord,
} from '@/types'

/**
 * Satu sumber kebenaran untuk seluruh aplikasi.
 *
 * Sekarang masih in-memory di atas data mock. Saat backend siap, cukup ganti
 * isi provider ini dengan pemanggilan API — signature action di bawah sudah
 * disusun menyerupai endpoint (create / update / delete), sehingga komponen
 * pemakainya tidak perlu diubah.
 */

interface AppStore {
  users: User[]
  ships: Ship[]
  crews: Crew[]
  categories: FishCategory[]
  scales: Scale[]
  landings: Landing[]
  weighings: WeighingRecord[]
  invoices: Invoice[]
  scans: MorphologyScan[]
  config: AppConfig

  addWeighing: (input: Omit<WeighingRecord, 'id'>) => WeighingRecord
  voidWeighing: (id: number) => void
  assignCrewTag: (weighingId: number, crewId: number | null) => void

  addScan: (input: Omit<MorphologyScan, 'id'>) => MorphologyScan
  linkScanToWeighing: (scanId: number, weighingId: number) => void

  createInvoice: (buyerUserId: number, weighingIds: number[]) => Invoice | null
  markInvoicePaid: (invoiceId: number) => void

  saveShip: (ship: Omit<Ship, 'id'> & { id?: number }) => void
  deleteShip: (id: number) => void
  saveCrew: (crew: Omit<Crew, 'id'> & { id?: number }) => void
  deleteCrew: (id: number) => void

  saveUser: (user: Omit<User, 'id'> & { id?: number }) => void
  deleteUser: (id: number) => void

  saveCategory: (category: Omit<FishCategory, 'id'> & { id?: number }) => void
  deleteCategory: (id: number) => void

  saveScale: (scale: Omit<Scale, 'id'> & { id?: number }) => void
  deleteScale: (id: number) => void

  updateConfig: (patch: Partial<AppConfig>) => void
}

const AppStoreContext = createContext<AppStore | null>(null)

const nextId = (rows: { id: number }[]) => (rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1)

/** Upsert generik — dipakai semua action save*() agar perilakunya seragam. */
function upsert<T extends { id: number }>(rows: T[], value: Omit<T, 'id'> & { id?: number }): T[] {
  if (value.id != null && rows.some((r) => r.id === value.id)) {
    return rows.map((r) => (r.id === value.id ? ({ ...r, ...value } as T) : r))
  }
  return [...rows, { ...value, id: nextId(rows) } as T]
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(USERS)
  const [ships, setShips] = useState<Ship[]>(SHIPS)
  const [crews, setCrews] = useState<Crew[]>(CREWS)
  const [categories, setCategories] = useState<FishCategory[]>(FISH_CATEGORIES)
  const [scales, setScales] = useState<Scale[]>(SCALES)
  const [landings] = useState<Landing[]>(LANDINGS)
  const [weighings, setWeighings] = useState<WeighingRecord[]>(WEIGHING_RECORDS)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [scans, setScans] = useState<MorphologyScan[]>([])
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG)

  const addWeighing = useCallback((input: Omit<WeighingRecord, 'id'>) => {
    const record = { ...input, id: 0 } as WeighingRecord
    setWeighings((prev) => {
      record.id = nextId(prev)
      return [...prev, record]
    })
    return record
  }, [])

  const voidWeighing = useCallback((id: number) => {
    setWeighings((prev) => prev.map((w) => (w.id === id ? { ...w, is_voided: true } : w)))
  }, [])

  const assignCrewTag = useCallback((weighingId: number, crewId: number | null) => {
    setWeighings((prev) => prev.map((w) => (w.id === weighingId ? { ...w, crew_id: crewId } : w)))
  }, [])

  const addScan = useCallback((input: Omit<MorphologyScan, 'id'>) => {
    const scan = { ...input, id: 0 } as MorphologyScan
    setScans((prev) => {
      scan.id = nextId(prev)
      return [scan, ...prev]
    })
    return scan
  }, [])

  const linkScanToWeighing = useCallback((scanId: number, weighingId: number) => {
    setScans((prev) =>
      prev.map((s) => (s.id === scanId ? { ...s, weighing_record_id: weighingId } : s)),
    )
  }, [])

  const createInvoice = useCallback(
    (buyerUserId: number, weighingIds: number[]) => {
      const picked = weighings.filter((w) => weighingIds.includes(w.id) && !w.invoice_id)
      if (!picked.length) return null

      const items = picked.map((w) => {
        const category = categories.find((c) => c.id === w.fish_category_id)
        const pricePerKg = category?.price_per_kg ?? 0
        return {
          weighing_record_id: w.id,
          fish_category_id: w.fish_category_id,
          weight_kg: w.weight_kg,
          price_per_kg: pricePerKg,
          subtotal: w.weight_kg * pricePerKg,
        }
      })

      const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0)
      const handlingFee = calculateHandlingFee(subtotal, config)

      const invoice: Invoice = {
        id: nextId(invoices),
        invoice_number: `INV/${new Date().getFullYear()}/${String(nextId(invoices)).padStart(4, '0')}`,
        buyer_user_id: buyerUserId,
        items,
        subtotal,
        handling_fee: handlingFee,
        total: subtotal + handlingFee,
        status: 'PENDING',
        created_at: new Date().toISOString(),
        paid_at: null,
      }

      setInvoices((prev) => [invoice, ...prev])
      setWeighings((prev) =>
        prev.map((w) => (weighingIds.includes(w.id) ? { ...w, invoice_id: invoice.id } : w)),
      )
      return invoice
    },
    [weighings, categories, config, invoices],
  )

  const markInvoicePaid = useCallback((invoiceId: number) => {
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === invoiceId ? { ...i, status: 'PAID', paid_at: new Date().toISOString() } : i,
      ),
    )
  }, [])

  const value = useMemo<AppStore>(
    () => ({
      users,
      ships,
      crews,
      categories,
      scales,
      landings,
      weighings,
      invoices,
      scans,
      config,
      addWeighing,
      voidWeighing,
      assignCrewTag,
      addScan,
      linkScanToWeighing,
      createInvoice,
      markInvoicePaid,
      saveShip: (ship) => setShips((prev) => upsert(prev, ship)),
      deleteShip: (id) => setShips((prev) => prev.filter((s) => s.id !== id)),
      saveCrew: (crew) => setCrews((prev) => upsert(prev, crew)),
      deleteCrew: (id) => setCrews((prev) => prev.filter((c) => c.id !== id)),
      saveUser: (user) => setUsers((prev) => upsert(prev, user)),
      deleteUser: (id) => setUsers((prev) => prev.filter((u) => u.id !== id)),
      saveCategory: (category) => setCategories((prev) => upsert(prev, category)),
      deleteCategory: (id) => setCategories((prev) => prev.filter((c) => c.id !== id)),
      saveScale: (scale) => setScales((prev) => upsert(prev, scale)),
      deleteScale: (id) => setScales((prev) => prev.filter((s) => s.id !== id)),
      updateConfig: (patch) => setConfig((prev) => ({ ...prev, ...patch })),
    }),
    [
      users,
      ships,
      crews,
      categories,
      scales,
      landings,
      weighings,
      invoices,
      scans,
      config,
      addWeighing,
      voidWeighing,
      assignCrewTag,
      addScan,
      linkScanToWeighing,
      createInvoice,
      markInvoicePaid,
    ],
  )

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext)
  if (!ctx) throw new Error('useAppStore harus dipakai di dalam <AppStoreProvider>')
  return ctx
}
