import { Coins, FileSpreadsheet, Printer, Receipt, Weight } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader, StatCard } from '@/components/ui/stat-card'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { calculatePNBP } from '@/data/config'
import { exportToCsv, exportToPdf } from '@/lib/export'
import { formatDateTime, formatIDR, formatKg } from '@/lib/format'
import { useAppStore } from '@/store/app-store'

const ALL = 'all'

export function ReportsPage() {
  const { weighings, categories, landings, ships, crews, config } = useAppStore()

  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [shipId, setShipId] = useState<string>(ALL)
  const [categoryId, setCategoryId] = useState<string>(ALL)
  const [crewId, setCrewId] = useState<string>(ALL)

  const rows = useMemo(() => {
    return weighings
      .filter((w) => !w.is_voided)
      .filter((w) => {
        const landing = landings.find((l) => l.id === w.landing_id)
        if (!landing) return false

        if (shipId !== ALL && landing.ship_id !== Number(shipId)) return false
        if (categoryId !== ALL && w.fish_category_id !== Number(categoryId)) return false
        if (crewId !== ALL && w.crew_id !== Number(crewId)) return false

        const at = w.weighed_at.slice(0, 10)
        if (from && at < from) return false
        if (to && at > to) return false
        return true
      })
      .sort((a, b) => b.weighed_at.localeCompare(a.weighed_at))
  }, [weighings, landings, shipId, categoryId, crewId, from, to])

  const totalWeight = rows.reduce((sum, w) => sum + w.weight_kg, 0)
  const totalValue = rows.reduce((sum, w) => {
    const c = categories.find((x) => x.id === w.fish_category_id)
    return sum + w.weight_kg * (c?.price_per_kg ?? 0)
  }, 0)
  const totalPNBP = rows.reduce((sum, w) => {
    const c = categories.find((x) => x.id === w.fish_category_id)
    if (!c) return sum
    return (
      sum +
      calculatePNBP(
        {
          weight_kg: w.weight_kg,
          pnbp_rate: c.pnbp_rate,
          transaction_value: w.weight_kg * (c.price_per_kg ?? 0),
        },
        config,
      )
    )
  }, 0)

  function nameOf(id: number | null, list: { id: number; name?: string }[]) {
    return list.find((x) => x.id === id)?.name ?? '—'
  }

  function handleExportCsv() {
    exportToCsv(
      `laporan-penimbangan-${new Date().toISOString().slice(0, 10)}`,
      [
        { header: 'Waktu', value: (w) => formatDateTime(w.weighed_at) },
        {
          header: 'Kapal',
          value: (w) => landings.find((l) => l.id === w.landing_id)?.ship.vessel_name ?? '',
        },
        {
          header: 'Kategori',
          value: (w) => categories.find((c) => c.id === w.fish_category_id)?.category_name ?? '',
        },
        { header: 'Berat (Kg)', value: (w) => w.weight_kg.toFixed(2) },
        { header: 'ABK', value: (w) => nameOf(w.crew_id, crews) },
        { header: 'Akurasi AI (%)', value: (w) => w.confidence_score ?? '' },
        {
          header: 'Estimasi PNBP (Rp)',
          value: (w) => {
            const c = categories.find((x) => x.id === w.fish_category_id)
            if (!c) return 0
            return Math.round(
              calculatePNBP(
                {
                  weight_kg: w.weight_kg,
                  pnbp_rate: c.pnbp_rate,
                  transaction_value: w.weight_kg * (c.price_per_kg ?? 0),
                },
                config,
              ),
            )
          },
        },
      ],
      rows,
    )
  }

  return (
    <div>
      <PageHeader
        title="Laporan Petugas PPS"
        description="Rekapitulasi penimbangan dan estimasi PNBP"
        actions={
          <>
            <Button variant="outline" onClick={handleExportCsv}>
              <FileSpreadsheet /> Export Excel
            </Button>
            <Button variant="outline" onClick={exportToPdf}>
              <Printer /> Export PDF
            </Button>
          </>
        }
      />

      <Card className="mb-5 print:hidden">
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Field label="Dari Tanggal">
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </Field>
            <Field label="Sampai Tanggal">
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </Field>
            <Field label="Kapal">
              <Select value={shipId} onValueChange={setShipId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Semua Kapal</SelectItem>
                  {ships.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.vessel_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Kategori Ikan">
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Semua Kategori</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="ABK">
              <Select value={crewId} onValueChange={setCrewId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Semua ABK</SelectItem>
                  {crews.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Transaksi" value={rows.length} icon={Receipt} tone="primary" />
        <StatCard label="Total Berat" value={formatKg(totalWeight)} icon={Weight} tone="success" />
        <StatCard label="Nilai Tangkapan" value={formatIDR(totalValue)} icon={Coins} tone="accent" />
        <StatCard label="Estimasi PNBP" value={formatIDR(totalPNBP)} icon={Coins} tone="warning" />
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Rincian Penimbangan</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Kapal</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Berat</TableHead>
                <TableHead>ABK</TableHead>
                <TableHead className="text-right">Estimasi PNBP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableEmpty colSpan={6}>Tidak ada data pada rentang filter ini.</TableEmpty>
              ) : (
                rows.map((w) => {
                  const category = categories.find((c) => c.id === w.fish_category_id)
                  const landing = landings.find((l) => l.id === w.landing_id)
                  const pnbp = category
                    ? calculatePNBP(
                        {
                          weight_kg: w.weight_kg,
                          pnbp_rate: category.pnbp_rate,
                          transaction_value: w.weight_kg * (category.price_per_kg ?? 0),
                        },
                        config,
                      )
                    : 0
                  return (
                    <TableRow key={w.id}>
                      <TableCell>{formatDateTime(w.weighed_at)}</TableCell>
                      <TableCell>{landing?.ship.vessel_name ?? '—'}</TableCell>
                      <TableCell>{category?.category_name ?? '—'}</TableCell>
                      <TableCell className="font-medium">{formatKg(w.weight_kg)}</TableCell>
                      <TableCell>{nameOf(w.crew_id, crews)}</TableCell>
                      <TableCell className="text-right">{formatIDR(pnbp)}</TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
