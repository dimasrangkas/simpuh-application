import { Anchor, CheckCircle2, Scale as ScaleIcon, Weight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { formatDateTime, formatKg, statusColor, statusLabel } from '@/lib/format'
import { useAppStore } from '@/store/app-store'

export function PpsDashboard({ onStartWeighing }: { onStartWeighing: (landingId: number) => void }) {
  const { landings, weighings, scales, categories } = useAppStore()

  const today = new Date().toDateString()
  const active = landings.filter((l) => l.status === 'IN_PROGRESS')
  const doneToday = landings.filter(
    (l) => l.status === 'COMPLETED' && new Date(l.landing_date).toDateString() === today,
  )
  const validRecords = weighings.filter((w) => !w.is_voided)
  const totalWeight = validRecords.reduce((sum, w) => sum + w.weight_kg, 0)
  const onlineScales = scales.filter((s) => s.status === 1)

  const byCategory = categories
    .map((c) => ({
      ...c,
      weight: validRecords
        .filter((w) => w.fish_category_id === c.id)
        .reduce((sum, w) => sum + w.weight_kg, 0),
    }))
    .filter((c) => c.weight > 0)
    .sort((a, b) => b.weight - a.weight)

  return (
    <div>
      <PageHeader title="Dashboard Petugas PPS" description="Ringkasan aktivitas bongkar muat hari ini" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Kapal Sedang Proses" value={active.length} icon={Anchor} tone="primary" />
        <StatCard label="Selesai Hari Ini" value={doneToday.length} icon={CheckCircle2} tone="success" />
        <StatCard
          label="Timbangan Aktif"
          value={`${onlineScales.length}/${scales.length}`}
          icon={ScaleIcon}
          tone="accent"
        />
        <StatCard label="Total Berat" value={formatKg(totalWeight)} icon={Weight} tone="warning" />
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Kapal dalam Proses Bongkar Muat</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kapal</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Waktu Pendaratan</TableHead>
                <TableHead>Petugas</TableHead>
                <TableHead>Penimbangan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {landings.length === 0 ? (
                <TableEmpty colSpan={7}>Belum ada pendaratan.</TableEmpty>
              ) : (
                landings.map((l) => {
                  const count = validRecords.filter((w) => w.landing_id === l.id).length
                  return (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium text-hi">{l.ship.vessel_name}</TableCell>
                      <TableCell>{l.ship.vessel_code}</TableCell>
                      <TableCell>{formatDateTime(l.landing_date)}</TableCell>
                      <TableCell>{l.officer.name}</TableCell>
                      <TableCell>{count} record</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(l.status)}`}
                        >
                          {statusLabel(l.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {l.status === 'IN_PROGRESS' ? (
                          <Button size="sm" onClick={() => onStartWeighing(l.id)}>
                            Mulai Penimbangan
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Kategori Ikan Hari Ini</CardTitle>
        </CardHeader>
        <CardContent>
          {byCategory.length === 0 ? (
            <p className="text-sm text-mid">Belum ada hasil tangkapan tercatat.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {byCategory.map((c) => (
                <div key={c.id} className="rounded-lg border border-border p-3">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <p className="text-sm font-medium text-hi">{c.category_name}</p>
                  </div>
                  <p className="text-lg font-semibold text-hi">{formatKg(c.weight)}</p>
                  <Badge variant="secondary" className="mt-1.5">
                    PNBP {c.pnbp_rate}/Kg
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
