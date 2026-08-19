import { Camera, Info, Link2, Loader2, ScanLine, Sparkles } from 'lucide-react'
import { useState } from 'react'
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
import { EmptyState, PageHeader } from '@/components/ui/stat-card'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { confidenceColor, formatDateTime, formatKg } from '@/lib/format'
import { createQualityDetectionProvider, type DetectionResult } from '@/services/quality-detection'
import { useAppStore } from '@/store/app-store'

const detector = createQualityDetectionProvider()

export function MorphologyPage() {
  const { landings, weighings, categories, scans, addScan, linkScanToWeighing } = useAppStore()

  const [landingId, setLandingId] = useState<number | null>(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [lastScanId, setLastScanId] = useState<number | null>(null)

  // Record penimbangan yang belum punya hasil deteksi — kandidat untuk dikaitkan.
  const linkable = weighings.filter(
    (w) => !w.is_voided && (landingId == null || w.landing_id === landingId),
  )

  async function handleScan() {
    setScanning(true)
    setResult(null)
    try {
      const detection = await detector.detect({ landingId: landingId ?? undefined })
      setResult(detection)
      const scan = addScan({
        weighing_record_id: null,
        landing_id: landingId,
        detected_category: detection.detected_category,
        confidence_score: detection.confidence_score,
        quality_grade: detection.quality_grade,
        estimated_length_cm: detection.estimated_length_cm,
        processing_time_ms: detection.processing_time_ms,
        source: detection.source,
        scanned_at: detection.detected_at,
      })
      setLastScanId(scan.id)
      toast.success(`Terdeteksi: ${detection.detected_category}`, {
        description: `Akurasi ${detection.confidence_score}%`,
      })
    } catch {
      toast.error('Scan gagal', { description: 'Silakan ulangi.' })
    } finally {
      setScanning(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Scan Morfologi"
        description="Identifikasi spesies, ukuran, dan kualitas hasil tangkapan"
      />

      {!detector.isLive ? (
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-accent/25 bg-accent/8 px-4 py-3">
          <Info className="mt-0.5 size-4 shrink-0 text-accent" />
          <div className="text-sm text-secondary">
            <p className="font-medium">Mode simulasi</p>
            <p className="mt-0.5 text-secondary">
              Modul AI belum terpasang. Ke depan deteksi berjalan otomatis lewat kamera IoT saat
              ikan ditimbang, tanpa scan manual. Alur dan tampilan di halaman ini sudah final —
              yang diganti nanti hanya sumber datanya.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Area Scan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Sesi Pendaratan (opsional)">
              <Select
                value={landingId != null ? String(landingId) : 'none'}
                onValueChange={(v) => setLandingId(v === 'none' ? null : Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tidak dikaitkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak dikaitkan</SelectItem>
                  {landings.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {l.ship.vessel_name} — {formatDateTime(l.landing_date)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-bg px-6 py-12">
              {scanning ? (
                <>
                  <Loader2 className="mb-3 size-10 animate-spin text-primary" />
                  <p className="text-sm font-medium text-mid">Menganalisa citra…</p>
                  <p className="mt-1 text-xs text-mid">Mendeteksi spesies, ukuran, dan kesegaran</p>
                </>
              ) : (
                <>
                  <ScanLine className="mb-3 size-10 text-low" />
                  <p className="text-sm font-medium text-mid">Siap melakukan scan</p>
                  <p className="mt-1 text-xs text-mid">
                    Arahkan kamera ke hasil tangkapan lalu tekan tombol di bawah
                  </p>
                </>
              )}
            </div>

            <Button className="w-full" onClick={() => void handleScan()} disabled={scanning}>
              {scanning ? <Loader2 className="animate-spin" /> : <Camera />}
              {scanning ? 'Memproses…' : 'Mulai Scan'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hasil Deteksi</CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <EmptyState
                icon={Sparkles}
                title="Belum ada hasil"
                description="Jalankan scan untuk melihat spesies dan skor akurasi."
              />
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-mid">Spesies terdeteksi</p>
                  <p className="text-lg font-semibold text-hi">{result.detected_category}</p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="ai">AI: {result.confidence_score}% akurat</Badge>
                  <Badge variant="success">Kualitas: {result.quality_grade}</Badge>
                </div>

                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-mid">Estimasi panjang</dt>
                    <dd className="text-hi">{result.estimated_length_cm} cm</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-mid">Waktu proses</dt>
                    <dd className="text-hi">{result.processing_time_ms} ms</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-mid">Sumber</dt>
                    <dd className="text-hi">{result.source}</dd>
                  </div>
                </dl>

                {lastScanId != null && linkable.length > 0 ? (
                  <Field label="Kaitkan ke penimbangan">
                    <Select
                      onValueChange={(v) => {
                        linkScanToWeighing(lastScanId, Number(v))
                        toast.success('Hasil scan dikaitkan ke record penimbangan')
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih record" />
                      </SelectTrigger>
                      <SelectContent>
                        {linkable.map((w) => (
                          <SelectItem key={w.id} value={String(w.id)}>
                            #{w.id} — {formatKg(w.weight_kg)} — {formatDateTime(w.weighed_at)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Riwayat Scan</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Spesies</TableHead>
                <TableHead>Akurasi</TableHead>
                <TableHead>Kualitas</TableHead>
                <TableHead>Panjang</TableHead>
                <TableHead>Penimbangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scans.length === 0 ? (
                <TableEmpty colSpan={6}>Belum ada riwayat scan.</TableEmpty>
              ) : (
                scans.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{formatDateTime(s.scanned_at)}</TableCell>
                    <TableCell className="font-medium text-hi">{s.detected_category}</TableCell>
                    <TableCell className={confidenceColor(s.confidence_score)}>
                      {s.confidence_score}%
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.quality_grade === 'Baik' ? 'success' : 'warning'}>
                        {s.quality_grade}
                      </Badge>
                    </TableCell>
                    <TableCell>{s.estimated_length_cm} cm</TableCell>
                    <TableCell>
                      {s.weighing_record_id != null ? (
                        <span className="inline-flex items-center gap-1 text-primary">
                          <Link2 className="size-3.5" /> #{s.weighing_record_id}
                        </span>
                      ) : (
                        <span className="text-low">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sisipkan kategori referensi supaya petugas bisa mencocokkan manual. */}
      <p className="mt-4 text-xs text-low">
        Kategori acuan: {categories.map((c) => c.category_name).join(' • ')}
      </p>
    </div>
  )
}
