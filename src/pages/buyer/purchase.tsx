import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox, Separator } from '@/components/ui/misc'
import { EmptyState, PageHeader } from '@/components/ui/stat-card'
import { calculateHandlingFee } from '@/data/config'
import { confidenceColor, formatDateTime, formatIDR, formatKg } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'

export function PurchasePage({
  buyerUserId,
  onBack,
  onDone,
}: {
  buyerUserId: number
  onBack: () => void
  onDone: () => void
}) {
  const { weighings, categories, landings, scales, config, createInvoice } = useAppStore()

  const available = weighings.filter((w) => !w.is_voided && !w.invoice_id)
  const [selected, setSelected] = useState<number[]>([])

  const selectedRows = available.filter((w) => selected.includes(w.id))
  const subtotal = selectedRows.reduce((sum, w) => {
    const category = categories.find((c) => c.id === w.fish_category_id)
    return sum + w.weight_kg * (category?.price_per_kg ?? 0)
  }, 0)
  const handlingFee = calculateHandlingFee(subtotal, config)
  const total = subtotal + handlingFee
  const totalWeight = selectedRows.reduce((sum, w) => sum + w.weight_kg, 0)

  function toggle(id: number) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function handleConfirm() {
    const invoice = createInvoice(buyerUserId, selected)
    if (!invoice) {
      toast.error('Gagal membuat pembelian.')
      return
    }
    toast.success(`Pembelian dikonfirmasi — ${invoice.invoice_number}`, {
      description: `Total ${formatIDR(invoice.total)}`,
    })
    setSelected([])
    onDone()
  }

  return (
    <div>
      <PageHeader
        title="Pembelian"
        description="Pilih hasil tangkapan yang ingin dibeli"
        actions={
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft /> Kembali
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Hasil Tangkapan Tersedia</CardTitle>
            {available.length > 0 ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setSelected(selected.length === available.length ? [] : available.map((w) => w.id))
                }
              >
                {selected.length === available.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-2">
            {available.length === 0 ? (
              <EmptyState
                icon={ShoppingCart}
                title="Tidak ada hasil tangkapan tersedia"
                description="Semua hasil tangkapan sudah terjual atau belum ada penimbangan baru."
              />
            ) : (
              available.map((w) => {
                const category = categories.find((c) => c.id === w.fish_category_id)
                const landing = landings.find((l) => l.id === w.landing_id)
                const scale = scales.find((s) => s.id === w.scale_id)
                const price = w.weight_kg * (category?.price_per_kg ?? 0)
                const checked = selected.includes(w.id)
                return (
                  <label
                    key={w.id}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
                      checked ? 'border-success bg-success/8' : 'border-border hover:bg-bg',
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggle(w.id)}
                      className="mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium text-hi">{category?.category_name ?? '—'}</p>
                        <p className="font-semibold text-hi">{formatIDR(price)}</p>
                      </div>
                      <p className="mt-0.5 text-sm text-mid">
                        {landing?.ship.vessel_name ?? '—'} • {formatKg(w.weight_kg)}
                      </p>
                      <p className="text-xs text-mid">
                        {scale?.unique_scale_id ?? '—'} • {formatDateTime(w.weighed_at)}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {w.confidence_score != null ? (
                          <Badge variant="ai" className={confidenceColor(w.confidence_score)}>
                            AI: {w.confidence_score}% akurat
                          </Badge>
                        ) : null}
                        {w.quality_grade ? <Badge variant="success">{w.quality_grade}</Badge> : null}
                      </div>
                    </div>
                  </label>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle>Ringkasan Pembelian</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-mid">Item dipilih</span>
              <span className="font-medium text-hi">{selectedRows.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-mid">Total berat</span>
              <span className="font-medium text-hi">{formatKg(totalWeight)}</span>
            </div>

            <Separator />

            <div className="flex justify-between text-sm">
              <span className="text-mid">Subtotal</span>
              <span className="font-medium text-hi">{formatIDR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-mid">
                Biaya penanganan ({config.handling_fee_percent}%)
              </span>
              <span className="font-medium text-hi">{formatIDR(handlingFee)}</span>
            </div>

            <Separator />

            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-hi">Total Bayar</span>
              <span className="text-xl font-semibold text-success">{formatIDR(total)}</span>
            </div>

            <Button
              variant="success"
              className="w-full"
              disabled={selectedRows.length === 0}
              onClick={handleConfirm}
            >
              <ShoppingCart /> Konfirmasi Pembelian
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
