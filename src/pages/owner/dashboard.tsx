import { Anchor, Coins, Users, Weight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
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
import { crewTagHex, formatDateTime, formatIDR, formatKg, statusColor, statusLabel } from '@/lib/format'
import { useAppStore } from '@/store/app-store'

export function OwnerDashboard({
  ownerUserId,
  onTagABK,
}: {
  ownerUserId: number
  onTagABK: () => void
}) {
  const { ships, crews, landings, weighings, categories, config } = useAppStore()

  const myShips = ships.filter((s) => s.owner_user_id === ownerUserId)
  const myShipIds = myShips.map((s) => s.id)
  const myLandings = landings.filter((l) => myShipIds.includes(l.ship_id))
  const myLandingIds = myLandings.map((l) => l.id)
  const myRecords = weighings.filter((w) => myLandingIds.includes(w.landing_id) && !w.is_voided)
  const myCrews = crews.filter((c) => myShipIds.includes(c.ship_id))

  const totalWeight = myRecords.reduce((sum, w) => sum + w.weight_kg, 0)
  const totalPNBP = myRecords.reduce((sum, w) => {
    const category = categories.find((c) => c.id === w.fish_category_id)
    if (!category) return sum
    return (
      sum +
      calculatePNBP(
        {
          weight_kg: w.weight_kg,
          pnbp_rate: category.pnbp_rate,
          transaction_value: w.weight_kg * (category.price_per_kg ?? 0),
        },
        config,
      )
    )
  }, 0)

  const activeLandings = myLandings.filter((l) => l.status === 'IN_PROGRESS')

  const byCategory = categories
    .map((c) => ({
      ...c,
      weight: myRecords
        .filter((w) => w.fish_category_id === c.id)
        .reduce((sum, w) => sum + w.weight_kg, 0),
    }))
    .filter((c) => c.weight > 0)

  const maxCategoryWeight = Math.max(1, ...byCategory.map((c) => c.weight))

  const byCrew = myCrews
    .map((c) => ({
      ...c,
      weight: myRecords.filter((w) => w.crew_id === c.id).reduce((sum, w) => sum + w.weight_kg, 0),
    }))
    .sort((a, b) => b.weight - a.weight)

  const maxCrewWeight = Math.max(1, ...byCrew.map((c) => c.weight))

  return (
    <div>
      <PageHeader
        title="Dashboard Pemilik Kapal"
        description="Ringkasan hasil tangkapan dan alokasi ABK"
        actions={
          <Button onClick={onTagABK}>
            <Users /> Kelola Tag Warna ABK
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Kapal Aktif" value={activeLandings.length} icon={Anchor} tone="primary" />
        <StatCard label="Total Hasil Tangkapan" value={formatKg(totalWeight)} icon={Weight} tone="success" />
        <StatCard label="Estimasi PNBP" value={formatIDR(totalPNBP)} icon={Coins} tone="warning" />
        <StatCard label="Jumlah ABK" value={myCrews.length} icon={Users} tone="accent" />
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Status Pendaratan Aktif</CardTitle>
        </CardHeader>
        <CardContent>
          {activeLandings.length === 0 ? (
            <p className="text-sm text-mid">Tidak ada pendaratan yang sedang berjalan.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {activeLandings.map((l) => {
                const records = myRecords.filter((w) => w.landing_id === l.id)
                const tagged = records.filter((w) => w.crew_id != null).length
                const pending = records.length - tagged
                const percent = records.length ? (tagged / records.length) * 100 : 0
                return (
                  <div key={l.id} className="rounded-lg border border-border p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="font-medium text-hi">{l.ship.vessel_name}</p>
                      <Badge variant={pending > 0 ? 'warning' : 'success'}>
                        {pending > 0 ? `${pending} menunggu tag` : 'Semua ditag'}
                      </Badge>
                    </div>
                    <p className="mb-2 text-xs text-mid">
                      {records.length} penimbangan • {tagged} sudah ditag
                    </p>
                    <Progress value={percent} indicatorClassName="bg-success" />
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hasil Tangkapan per Kategori</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {byCategory.length === 0 ? (
              <p className="text-sm text-mid">Belum ada data.</p>
            ) : (
              byCategory.map((c) => (
                <div key={c.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-mid">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.category_name}
                    </span>
                    <span className="font-medium text-hi">{formatKg(c.weight)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(c.weight / maxCategoryWeight) * 100}%`,
                        backgroundColor: c.color,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribusi Berat per ABK</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {byCrew.length === 0 ? (
              <p className="text-sm text-mid">Belum ada ABK terdaftar.</p>
            ) : (
              byCrew.map((c) => (
                <div key={c.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-mid">
                      <span
                        className="size-3 rounded-full border border-border"
                        style={{ backgroundColor: crewTagHex(c.crew_tag_color) }}
                      />
                      {c.name}
                    </span>
                    <span className="font-medium text-hi">{formatKg(c.weight)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(c.weight / maxCrewWeight) * 100}%`,
                        backgroundColor: crewTagHex(c.crew_tag_color),
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Riwayat Pendaratan</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kapal</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Total Berat</TableHead>
                <TableHead>Estimasi PNBP</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myLandings.length === 0 ? (
                <TableEmpty colSpan={5}>Belum ada riwayat pendaratan.</TableEmpty>
              ) : (
                myLandings.map((l) => {
                  const records = myRecords.filter((w) => w.landing_id === l.id)
                  const weight = records.reduce((sum, w) => sum + w.weight_kg, 0)
                  const pnbp = records.reduce((sum, w) => {
                    const category = categories.find((c) => c.id === w.fish_category_id)
                    if (!category) return sum
                    return (
                      sum +
                      calculatePNBP(
                        {
                          weight_kg: w.weight_kg,
                          pnbp_rate: category.pnbp_rate,
                          transaction_value: w.weight_kg * (category.price_per_kg ?? 0),
                        },
                        config,
                      )
                    )
                  }, 0)
                  return (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium text-hi">{l.ship.vessel_name}</TableCell>
                      <TableCell>{formatDateTime(l.landing_date)}</TableCell>
                      <TableCell>{formatKg(weight)}</TableCell>
                      <TableCell>{formatIDR(pnbp)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(l.status)}`}
                        >
                          {statusLabel(l.status)}
                        </span>
                      </TableCell>
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
