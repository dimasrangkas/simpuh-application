import { FileSpreadsheet, Printer, Users, Weight } from 'lucide-react'
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
import { crewTagHex, formatIDR, formatKg } from '@/lib/format'
import { useAppStore } from '@/store/app-store'

const ALL = 'all'

export function CrewReportPage({ ownerUserId }: { ownerUserId: number }) {
  const { ships, crews, landings, weighings, categories, config } = useAppStore()

  const myShips = useMemo(
    () => ships.filter((s) => s.owner_user_id === ownerUserId),
    [ships, ownerUserId],
  )
  const myShipIds = useMemo(() => myShips.map((s) => s.id), [myShips])
  const myCrews = useMemo(
    () => crews.filter((c) => myShipIds.includes(c.ship_id)),
    [crews, myShipIds],
  )

  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [shipId, setShipId] = useState<string>(ALL)

  const records = useMemo(() => {
    return weighings.filter((w) => {
      if (w.is_voided) return false
      const landing = landings.find((l) => l.id === w.landing_id)
      if (!landing || !myShipIds.includes(landing.ship_id)) return false
      if (shipId !== ALL && landing.ship_id !== Number(shipId)) return false
      const at = w.weighed_at.slice(0, 10)
      if (from && at < from) return false
      if (to && at > to) return false
      return true
    })
  }, [weighings, landings, myShipIds, shipId, from, to])

  const summary = useMemo(() => {
    return myCrews
      .map((crew) => {
        const rows = records.filter((w) => w.crew_id === crew.id)
        const weight = rows.reduce((sum, w) => sum + w.weight_kg, 0)
        const value = rows.reduce((sum, w) => {
          const c = categories.find((x) => x.id === w.fish_category_id)
          return sum + w.weight_kg * (c?.price_per_kg ?? 0)
        }, 0)
        const pnbp = rows.reduce((sum, w) => {
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
        return { crew, count: rows.length, weight, value, pnbp }
      })
      .sort((a, b) => b.weight - a.weight)
  }, [myCrews, records, categories, config])

  const totalWeight = summary.reduce((sum, s) => sum + s.weight, 0)
  const totalValue = summary.reduce((sum, s) => sum + s.value, 0)
  const untaggedWeight = records
    .filter((w) => w.crew_id == null)
    .reduce((sum, w) => sum + w.weight_kg, 0)

  return (
    <div>
      <PageHeader
        title="Laporan ABK"
        description="Rekapitulasi hasil tangkapan per anak buah kapal"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() =>
                exportToCsv(
                  `laporan-abk-${new Date().toISOString().slice(0, 10)}`,
                  [
                    { header: 'Nama ABK', value: (s) => s.crew.name },
                    { header: 'Tag Warna', value: (s) => s.crew.crew_tag_color },
                    { header: 'NIK', value: (s) => s.crew.identification_number },
                    { header: 'Jumlah Penimbangan', value: (s) => s.count },
                    { header: 'Total Berat (Kg)', value: (s) => s.weight.toFixed(2) },
                    { header: 'Nilai Tangkapan (Rp)', value: (s) => Math.round(s.value) },
                    { header: 'Estimasi PNBP (Rp)', value: (s) => Math.round(s.pnbp) },
                  ],
                  summary,
                )
              }
            >
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
          <div className="grid gap-4 sm:grid-cols-3">
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
                  {myShips.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.vessel_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Jumlah ABK" value={myCrews.length} icon={Users} tone="accent" />
        <StatCard label="Total Berat Ditag" value={formatKg(totalWeight)} icon={Weight} tone="success" />
        <StatCard
          label="Belum Ditag"
          value={formatKg(untaggedWeight)}
          icon={Weight}
          tone="warning"
          hint={untaggedWeight > 0 ? 'Perlu dialokasikan di halaman Tag ABK' : undefined}
        />
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Rekap per ABK</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ABK</TableHead>
                <TableHead>Tag</TableHead>
                <TableHead>Penimbangan</TableHead>
                <TableHead>Total Berat</TableHead>
                <TableHead>Kontribusi</TableHead>
                <TableHead className="text-right">Nilai Tangkapan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.length === 0 ? (
                <TableEmpty colSpan={6}>Belum ada ABK terdaftar.</TableEmpty>
              ) : (
                summary.map((s) => {
                  const percent = totalWeight ? (s.weight / totalWeight) * 100 : 0
                  return (
                    <TableRow key={s.crew.id}>
                      <TableCell className="font-medium text-hi">{s.crew.name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="size-3 rounded-full border border-border"
                            style={{ backgroundColor: crewTagHex(s.crew.crew_tag_color) }}
                          />
                          {s.crew.crew_tag_color}
                        </span>
                      </TableCell>
                      <TableCell>{s.count}x</TableCell>
                      <TableCell className="font-medium">{formatKg(s.weight)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-border">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${percent}%`,
                                backgroundColor: crewTagHex(s.crew.crew_tag_color),
                              }}
                            />
                          </div>
                          <span className="text-xs text-mid">{percent.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{formatIDR(s.value)}</TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="mt-3 text-right text-sm text-mid">
        Total nilai tangkapan: <span className="font-semibold text-hi">{formatIDR(totalValue)}</span>
      </p>
    </div>
  )
}
