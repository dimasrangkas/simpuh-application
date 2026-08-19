import { Anchor, FileText, Package, Weight } from 'lucide-react'

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
import { confidenceColor, formatDateTime, formatIDR, formatKg } from '@/lib/format'
import { useAppStore } from '@/store/app-store'

export function BuyerDashboard({
  buyerUserId,
  onPurchase,
}: {
  buyerUserId: number
  onPurchase: () => void
}) {
  const { weighings, categories, landings, scales, invoices } = useAppStore()

  const available = weighings.filter((w) => !w.is_voided && !w.invoice_id)
  const totalWeight = available.reduce((sum, w) => sum + w.weight_kg, 0)
  const activeShips = new Set(
    available.map((w) => landings.find((l) => l.id === w.landing_id)?.ship_id).filter(Boolean),
  ).size
  const pendingInvoices = invoices.filter(
    (i) => i.buyer_user_id === buyerUserId && i.status === 'PENDING',
  ).length

  const byCategory = categories
    .map((c) => {
      const rows = available.filter((w) => w.fish_category_id === c.id)
      const weight = rows.reduce((sum, w) => sum + w.weight_kg, 0)
      return { ...c, weight, count: rows.length, value: weight * (c.price_per_kg ?? 0) }
    })
    .filter((c) => c.weight > 0)

  return (
    <div>
      <PageHeader
        title="Dashboard Pembeli"
        description="Hasil tangkapan yang siap dibeli"
        actions={
          <Button variant="success" onClick={onPurchase}>
            Buat Pembelian
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tersedia untuk Dibeli" value={available.length} icon={Package} tone="primary" />
        <StatCard label="Total Berat Tersedia" value={formatKg(totalWeight)} icon={Weight} tone="success" />
        <StatCard label="Kapal Aktif" value={activeShips} icon={Anchor} tone="accent" />
        <StatCard label="Invoice Pending" value={pendingInvoices} icon={FileText} tone="warning" />
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Hasil Tangkapan per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          {byCategory.length === 0 ? (
            <p className="text-sm text-mid">Belum ada hasil tangkapan tersedia.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {byCategory.map((c) => (
                <div key={c.id} className="rounded-lg border border-border p-4">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <p className="text-sm font-medium text-hi">{c.category_name}</p>
                  </div>
                  <p className="text-lg font-semibold text-hi">{formatKg(c.weight)}</p>
                  <p className="mt-0.5 text-xs text-mid">
                    {formatIDR(c.price_per_kg ?? 0)} / Kg
                  </p>
                  <p className="mt-1.5 text-sm font-medium text-success">
                    Estimasi {formatIDR(c.value)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Hasil Tangkapan Siap Beli</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kategori</TableHead>
                <TableHead>Kapal Asal</TableHead>
                <TableHead>Berat</TableHead>
                <TableHead>Timbangan</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Kualitas</TableHead>
                <TableHead className="text-right">Estimasi Harga</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {available.length === 0 ? (
                <TableEmpty colSpan={7}>Tidak ada hasil tangkapan tersedia.</TableEmpty>
              ) : (
                available.map((w) => {
                  const category = categories.find((c) => c.id === w.fish_category_id)
                  const landing = landings.find((l) => l.id === w.landing_id)
                  const scale = scales.find((s) => s.id === w.scale_id)
                  return (
                    <TableRow key={w.id}>
                      <TableCell className="font-medium text-hi">
                        {category?.category_name ?? '—'}
                      </TableCell>
                      <TableCell>{landing?.ship.vessel_name ?? '—'}</TableCell>
                      <TableCell>{formatKg(w.weight_kg)}</TableCell>
                      <TableCell className="text-xs">{scale?.unique_scale_id ?? '—'}</TableCell>
                      <TableCell>{formatDateTime(w.weighed_at)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {w.confidence_score != null ? (
                            <Badge variant="ai" className={confidenceColor(w.confidence_score)}>
                              AI: {w.confidence_score}%
                            </Badge>
                          ) : null}
                          {w.quality_grade ? (
                            <Badge variant="success">{w.quality_grade}</Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-hi">
                        {formatIDR(w.weight_kg * (category?.price_per_kg ?? 0))}
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
