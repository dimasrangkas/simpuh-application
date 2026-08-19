import {
  ArrowLeft,
  Ban,
  Camera,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  WifiOff,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/ui/stat-card'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useWeighingDevice } from '@/hooks/use-weighing-device'
import { confidenceColor, formatDateTime, formatKg } from '@/lib/format'
import { cn } from '@/lib/utils'
import { createQualityDetectionProvider, type DetectionResult } from '@/services/quality-detection'
import { useAppStore } from '@/store/app-store'

const detector = createQualityDetectionProvider()

export function WeighingPage({ landingId, onBack }: { landingId: number; onBack: () => void }) {
  const { landings, scales, categories, weighings, addWeighing, voidWeighing, addScan } =
    useAppStore()

  const landing = landings.find((l) => l.id === landingId)
  const onlineScales = useMemo(() => scales.filter((s) => s.status === 1), [scales])

  const [scaleId, setScaleId] = useState<number | null>(onlineScales[0]?.id ?? null)
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [detecting, setDetecting] = useState(false)
  const [detection, setDetection] = useState<DetectionResult | null>(null)
  const [saving, setSaving] = useState(false)

  const selectedScale = scales.find((s) => s.id === scaleId) ?? null
  const { reading, status, lastStable, transport, isConnected, tare, reconnect } =
    useWeighingDevice(selectedScale?.id ?? null, selectedScale?.unique_scale_id ?? null)

  const sessionRecords = weighings
    .filter((w) => w.landing_id === landingId)
    .sort((a, b) => b.weighed_at.localeCompare(a.weighed_at))

  // Berat yang dipakai menyimpan: pembacaan stabil terakhir, tahan putus koneksi.
  const capturedWeight = lastStable?.weight_kg ?? null
  const canSave = capturedWeight != null && capturedWeight > 0 && categoryId != null && !saving

  if (!landing) {
    return (
      <div className="p-6">
        <p className="text-mid">Data pendaratan tidak ditemukan.</p>
        <Button variant="outline" className="mt-4" onClick={onBack}>
          <ArrowLeft /> Kembali
        </Button>
      </div>
    )
  }

  async function handleDetect() {
    setDetecting(true)
    setDetection(null)
    try {
      const result = await detector.detect({ scaleId: scaleId ?? undefined, landingId })
      setDetection(result)
      const matched = categories.find((c) => c.category_name === result.detected_category)
      if (matched) setCategoryId(matched.id)
      toast.success(`Terdeteksi: ${result.detected_category}`, {
        description: `Akurasi ${result.confidence_score}% • ${result.processing_time_ms} ms`,
      })
    } catch {
      toast.error('Deteksi gagal', { description: 'Coba ulangi pengambilan foto.' })
    } finally {
      setDetecting(false)
    }
  }

  async function handleSave() {
    if (!canSave || categoryId == null || capturedWeight == null) return
    setSaving(true)

    const record = addWeighing({
      landing_id: landingId,
      scale_id: scaleId ?? 0,
      fish_category_id: categoryId,
      weight_kg: capturedWeight,
      confidence_score: detection?.confidence_score ?? null,
      quality_grade: detection?.quality_grade ?? null,
      photo_url: null,
      crew_id: null, // masuk antrian Tag ABK milik pemilik kapal
      weighed_at: new Date().toISOString(),
      is_voided: false,
      invoice_id: null,
    })

    if (detection) {
      addScan({
        weighing_record_id: record.id,
        landing_id: landingId,
        detected_category: detection.detected_category,
        confidence_score: detection.confidence_score,
        quality_grade: detection.quality_grade,
        estimated_length_cm: detection.estimated_length_cm,
        processing_time_ms: detection.processing_time_ms,
        source: detection.source,
        scanned_at: detection.detected_at,
      })
    }

    toast.success('Penimbangan tersimpan', {
      description: `${formatKg(capturedWeight)} — masuk antrian Tag ABK.`,
    })

    await tare()
    setDetection(null)
    setCategoryId(null)
    setSaving(false)
  }

  return (
    <div>
      <PageHeader
        title={`Penimbangan — ${landing.ship.vessel_name}`}
        description={`${landing.ship.vessel_code} • Petugas ${landing.officer.name} • ${formatDateTime(landing.landing_date)}`}
        actions={
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft /> Kembali
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Panel timbangan live */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Pembacaan Timbangan</CardTitle>
            <Badge variant={isConnected ? 'success' : status.state === 'reconnecting' ? 'warning' : 'destructive'}>
              {isConnected ? <CheckCircle2 className="size-3" /> : <WifiOff className="size-3" />}
              {status.message}
            </Badge>
          </CardHeader>

          <CardContent className="space-y-4">
            <Field label="Timbangan" hint={`Transport: ${transport}`}>
              <Select
                value={scaleId != null ? String(scaleId) : undefined}
                onValueChange={(v) => setScaleId(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih timbangan" />
                </SelectTrigger>
                <SelectContent>
                  {onlineScales.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.unique_scale_id} — {s.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {/* Angka besar berat */}
            <div
              className={cn(
                'rounded-xl border-2 px-6 py-8 text-center transition-colors',
                reading?.is_stable
                  ? 'border-success/35 bg-success/8'
                  : isConnected
                    ? 'border-primary/25 bg-primary/8'
                    : 'border-border bg-bg',
              )}
            >
              <p className="text-5xl font-semibold tabular-nums text-hi">
                {(reading?.weight_kg ?? capturedWeight ?? 0).toFixed(2)}
                <span className="ml-2 text-2xl font-normal text-mid">Kg</span>
              </p>
              <p className="mt-2 text-sm text-mid">
                {!isConnected
                  ? 'Menunggu koneksi timbangan…'
                  : reading?.is_stable
                    ? 'Berat stabil — siap disimpan'
                    : 'Menstabilkan…'}
              </p>
              {reading ? (
                <p className="mt-2 text-xs text-low">
                  Baterai {reading.battery_level}% • {reading.temperature_celsius}°C •{' '}
                  {formatDateTime(reading.reading_timestamp)}
                </p>
              ) : null}
            </div>

            {!isConnected ? (
              <div className="flex items-center justify-between gap-3 rounded-lg bg-warning/10 px-4 py-3">
                <p className="text-sm text-[#b4762f]">
                  Timbangan tidak terhubung. Berat stabil terakhir tetap tersimpan sementara.
                </p>
                <Button size="sm" variant="outline" onClick={reconnect}>
                  <RefreshCw /> Sambung ulang
                </Button>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => void tare()}>
                <Trash2 /> Nol-kan (Tare)
              </Button>
              <Button variant="secondary" onClick={() => void handleDetect()} disabled={detecting}>
                {detecting ? <Loader2 className="animate-spin" /> : <Camera />}
                {detecting ? 'Menganalisa…' : 'Ambil Foto & Deteksi'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Panel simpan */}
        <Card>
          <CardHeader>
            <CardTitle>Simpan Hasil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Kategori Ikan">
              <Select
                value={categoryId != null ? String(categoryId) : undefined}
                onValueChange={(v) => setCategoryId(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {detection ? (
              <div className="space-y-2 rounded-lg bg-accent/8 p-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-accent" />
                  <p className="text-sm font-medium text-secondary">Hasil Deteksi</p>
                </div>
                <p className="text-sm text-mid">{detection.detected_category}</p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="ai">AI: {detection.confidence_score}% akurat</Badge>
                  <Badge variant="success">Kualitas: {detection.quality_grade}</Badge>
                  <Badge variant="secondary">± {detection.estimated_length_cm} cm</Badge>
                </div>
                {!detector.isLive ? (
                  <p className="text-xs text-secondary">
                    Sumber: {detection.source} — kamera IoT belum terpasang.
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="rounded-lg bg-bg px-3 py-2.5 text-xs text-mid">
                Deteksi spesies bersifat opsional. Kategori tetap bisa dipilih manual.
              </p>
            )}

            <div className="rounded-lg border border-border px-3 py-2.5">
              <p className="text-xs text-mid">Berat akan disimpan</p>
              <p className="text-lg font-semibold text-hi">
                {capturedWeight != null ? formatKg(capturedWeight) : '—'}
              </p>
            </div>

            <Button className="w-full" disabled={!canSave} onClick={() => void handleSave()}>
              {saving ? <Loader2 className="animate-spin" /> : <Save />}
              Simpan Penimbangan
            </Button>
            {!canSave && capturedWeight == null ? (
              <p className="text-center text-xs text-mid">Menunggu berat stabil dari timbangan.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Riwayat sesi */}
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Riwayat Penimbangan Sesi Ini</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Berat</TableHead>
                <TableHead>Akurasi AI</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessionRecords.length === 0 ? (
                <TableEmpty colSpan={6}>Belum ada penimbangan pada sesi ini.</TableEmpty>
              ) : (
                sessionRecords.map((r) => {
                  const category = categories.find((c) => c.id === r.fish_category_id)
                  return (
                    <TableRow key={r.id} className={cn(r.is_voided && 'opacity-50')}>
                      <TableCell>{formatDateTime(r.weighed_at)}</TableCell>
                      <TableCell>{category?.category_name ?? '—'}</TableCell>
                      <TableCell className="font-medium">{formatKg(r.weight_kg)}</TableCell>
                      <TableCell>
                        {r.confidence_score != null ? (
                          <span className={confidenceColor(r.confidence_score)}>
                            {r.confidence_score}%
                          </span>
                        ) : (
                          <span className="text-low">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {r.is_voided ? (
                          <Badge variant="destructive">Dibatalkan</Badge>
                        ) : r.crew_id != null ? (
                          <Badge variant="success">Sudah ditag</Badge>
                        ) : (
                          <Badge variant="warning">Menunggu tag</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!r.is_voided ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-danger hover:bg-danger/8"
                            onClick={() => {
                              voidWeighing(r.id)
                              toast.success('Penimbangan dibatalkan')
                            }}
                          >
                            <Ban /> Void
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
    </div>
  )
}
