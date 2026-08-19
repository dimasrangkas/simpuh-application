import { Anchor, Scale as ScaleIcon, Users, Weight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader, StatCard } from '@/components/ui/stat-card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ROLE_LABEL } from '@/auth/permissions'
import { calculatePNBP } from '@/data/config'
import { formatDateTime, formatIDR, formatKg } from '@/lib/format'
import { useAppStore } from '@/store/app-store'

export function AdminDashboard() {
  const { users, ships, scales, landings, weighings, categories, config } = useAppStore()

  const valid = weighings.filter((w) => !w.is_voided)
  const totalWeight = valid.reduce((sum, w) => sum + w.weight_kg, 0)
  const totalPNBP = valid.reduce((sum, w) => {
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

  const online = scales.filter((s) => s.status === 1)
  const byRole = (Object.keys(ROLE_LABEL) as (keyof typeof ROLE_LABEL)[]).map((role) => ({
    role,
    count: users.filter((u) => u.role === role).length,
  }))

  return (
    <div>
      <PageHeader title="Dashboard Admin" description="Ringkasan sistem SIMPUH" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Pengguna" value={users.length} icon={Users} tone="blue" />
        <StatCard label="Kapal Terdaftar" value={ships.length} icon={Anchor} tone="green" />
        <StatCard
          label="Timbangan Online"
          value={`${online.length}/${scales.length}`}
          icon={ScaleIcon}
          tone="purple"
        />
        <StatCard label="Total Berat Tercatat" value={formatKg(totalWeight)} icon={Weight} tone="amber" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pengguna per Peran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {byRole.map((r) => (
              <div key={r.role} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-sm text-gray-700">{ROLE_LABEL[r.role]}</span>
                <Badge variant="secondary">{r.count} pengguna</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estimasi PNBP Terkumpul</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-gray-900">{formatIDR(totalPNBP)}</p>
            <p className="mt-1 text-sm text-gray-500">
              Metode aktif:{' '}
              {config.pnbp_method === 'per_kg_rate'
                ? 'Tarif per Kg per kategori'
                : `${config.pnbp_percent}% dari nilai transaksi`}
            </p>
            <p className="mt-3 text-xs text-gray-400">
              Formula demo — dapat diubah di halaman Pengaturan.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Pendaratan Terbaru</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kapal</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Petugas</TableHead>
                <TableHead className="text-right">Penimbangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {landings.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium text-gray-900">{l.ship.vessel_name}</TableCell>
                  <TableCell>{formatDateTime(l.landing_date)}</TableCell>
                  <TableCell>{l.officer.name}</TableCell>
                  <TableCell className="text-right">
                    {valid.filter((w) => w.landing_id === l.id).length}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
