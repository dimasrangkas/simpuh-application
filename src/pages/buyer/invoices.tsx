import { CheckCircle2, FileText, Printer } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/misc'
import { EmptyState, PageHeader } from '@/components/ui/stat-card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DEFAULT_CONFIG } from '@/data/config'
import { formatDateTime, formatIDR, formatKg, statusColor, statusLabel } from '@/lib/format'
import { useAppStore } from '@/store/app-store'
import type { Invoice } from '@/types'

export function InvoicesPage({ buyerUserId }: { buyerUserId: number }) {
  const { invoices, categories, markInvoicePaid } = useAppStore()
  const [detail, setDetail] = useState<Invoice | null>(null)

  const myInvoices = invoices.filter((i) => i.buyer_user_id === buyerUserId)

  function categoryName(id: number) {
    return categories.find((c) => c.id === id)?.category_name ?? '—'
  }

  return (
    <div>
      <PageHeader title="Invoice Pembelian" description="Riwayat transaksi dan status pembayaran" />

      <Card>
        <CardHeader>
          <CardTitle>Daftar Invoice</CardTitle>
        </CardHeader>
        <CardContent className={myInvoices.length ? 'px-0 pb-0' : undefined}>
          {myInvoices.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Belum ada invoice"
              description="Invoice terbit otomatis setelah pembelian dikonfirmasi."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Invoice</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myInvoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium text-hi">{inv.invoice_number}</TableCell>
                    <TableCell>{formatDateTime(inv.created_at)}</TableCell>
                    <TableCell>{inv.items.length} item</TableCell>
                    <TableCell className="font-medium">{formatIDR(inv.total)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(inv.status)}`}
                      >
                        {statusLabel(inv.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setDetail(inv)}>
                          Detail
                        </Button>
                        {inv.status === 'PENDING' ? (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => {
                              markInvoicePaid(inv.id)
                              toast.success('Invoice ditandai lunas')
                            }}
                          >
                            <CheckCircle2 /> Lunas
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={detail != null} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl print:shadow-none">
          <DialogHeader>
            <DialogTitle>{detail?.invoice_number}</DialogTitle>
            <DialogDescription>
              {DEFAULT_CONFIG.organization_name} — {DEFAULT_CONFIG.organization_subtitle}
            </DialogDescription>
          </DialogHeader>

          {detail ? (
            <div className="space-y-4">
              <div className="flex flex-wrap justify-between gap-3 text-sm">
                <div>
                  <p className="text-mid">Tanggal terbit</p>
                  <p className="text-hi">{formatDateTime(detail.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-mid">Status</p>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(detail.status)}`}
                  >
                    {statusLabel(detail.status)}
                  </span>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Berat</TableHead>
                      <TableHead>Harga/Kg</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.items.map((item) => (
                      <TableRow key={item.weighing_record_id}>
                        <TableCell>{categoryName(item.fish_category_id)}</TableCell>
                        <TableCell>{formatKg(item.weight_kg)}</TableCell>
                        <TableCell>{formatIDR(item.price_per_kg)}</TableCell>
                        <TableCell className="text-right">{formatIDR(item.subtotal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-mid">Subtotal</span>
                  <span className="text-hi">{formatIDR(detail.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-mid">Biaya penanganan</span>
                  <span className="text-hi">{formatIDR(detail.handling_fee)}</span>
                </div>
                <Separator />
                <div className="flex items-baseline justify-between">
                  <span className="font-medium text-hi">Total</span>
                  <span className="text-lg font-semibold text-success">
                    {formatIDR(detail.total)}
                  </span>
                </div>
                {detail.paid_at ? (
                  <p className="text-xs text-mid">
                    Dibayar pada {formatDateTime(detail.paid_at)}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer /> Cetak
            </Button>
            <Button onClick={() => setDetail(null)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
