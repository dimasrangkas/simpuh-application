import { Activity, Pencil, Plus, Trash2, Wifi, WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
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
import { Field, Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/misc'
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
import { formatDateTime, formatKg } from '@/lib/format'
import { createWeighingDevice, type ScaleReading } from '@/services/weighing-device'
import { useAppStore } from '@/store/app-store'

type ScaleDraft = {
  id?: number
  unique_scale_id: string
  location: string
  status: 0 | 1
  last_calibrated_at?: string
}

const EMPTY: ScaleDraft = { unique_scale_id: '', location: '', status: 1 }

export function ScalesPage() {
  const { scales, saveScale, deleteScale } = useAppStore()
  const [draft, setDraft] = useState<ScaleDraft | null>(null)
  const [monitorId, setMonitorId] = useState<number | null>(null)
  const [log, setLog] = useState<ScaleReading[]>([])

  const online = scales.filter((s) => s.status === 1)
  const monitored = scales.find((s) => s.id === monitorId) ?? null

  // Log pembacaan live lewat abstraksi yang sama dipakai halaman Penimbangan.
  useEffect(() => {
    if (!monitored) {
      setLog([])
      return
    }
    const device = createWeighingDevice()
    const off = device.subscribe((r) => setLog((prev) => [r, ...prev].slice(0, 12)))
    void device.connect(monitored.id, monitored.unique_scale_id)
    return () => {
      off()
      device.disconnect()
    }
  }, [monitored])

  function handleSave() {
    if (!draft) return
    if (!draft.unique_scale_id.trim() || !draft.location.trim()) {
      toast.error('ID alat dan lokasi wajib diisi.')
      return
    }
    const clash = scales.find(
      (s) => s.unique_scale_id === draft.unique_scale_id.trim() && s.id !== draft.id,
    )
    if (clash) {
      toast.error('ID alat sudah terdaftar.')
      return
    }
    saveScale({ ...draft, unique_scale_id: draft.unique_scale_id.trim() })
    toast.success(draft.id ? 'Timbangan diperbarui' : 'Timbangan didaftarkan')
    setDraft(null)
  }

  return (
    <div>
      <PageHeader
        title="Timbangan IoT"
        description="Registrasi perangkat, status koneksi, dan log pembacaan"
        actions={
          <Button onClick={() => setDraft(EMPTY)}>
            <Plus /> Daftarkan Timbangan
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Perangkat" value={scales.length} icon={Activity} tone="blue" />
        <StatCard label="Online" value={online.length} icon={Wifi} tone="green" />
        <StatCard label="Offline" value={scales.length - online.length} icon={WifiOff} tone="gray" />
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Perangkat Terdaftar</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Alat</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Kalibrasi Terakhir</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scales.length === 0 ? (
                <TableEmpty colSpan={5}>Belum ada timbangan terdaftar.</TableEmpty>
              ) : (
                scales.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium text-gray-900">{s.unique_scale_id}</TableCell>
                    <TableCell>{s.location}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === 1 ? 'success' : 'destructive'}>
                        {s.status === 1 ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
                        {s.status === 1 ? 'Online' : 'Offline'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {s.last_calibrated_at ? formatDateTime(s.last_calibrated_at) : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant={monitorId === s.id ? 'default' : 'outline'}
                          disabled={s.status !== 1}
                          onClick={() => setMonitorId(monitorId === s.id ? null : s.id)}
                        >
                          <Activity /> {monitorId === s.id ? 'Berhenti' : 'Pantau'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setDraft({
                              id: s.id,
                              unique_scale_id: s.unique_scale_id,
                              location: s.location,
                              status: s.status,
                              last_calibrated_at: s.last_calibrated_at,
                            })
                          }
                        >
                          <Pencil />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => {
                            deleteScale(s.id)
                            if (monitorId === s.id) setMonitorId(null)
                            toast.success('Timbangan dihapus')
                          }}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {monitored ? (
        <Card className="mt-5">
          <CardHeader>
            <CardTitle>Log Pembacaan — {monitored.unique_scale_id}</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Berat</TableHead>
                  <TableHead>Stabil</TableHead>
                  <TableHead>Baterai</TableHead>
                  <TableHead className="text-right">Suhu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {log.length === 0 ? (
                  <TableEmpty colSpan={5}>Menunggu data dari perangkat…</TableEmpty>
                ) : (
                  log.map((r, i) => (
                    <TableRow key={`${r.reading_timestamp}-${i}`}>
                      <TableCell>{formatDateTime(r.reading_timestamp)}</TableCell>
                      <TableCell className="font-medium">{formatKg(r.weight_kg)}</TableCell>
                      <TableCell>
                        <Badge variant={r.is_stable ? 'success' : 'warning'}>
                          {r.is_stable ? 'Stabil' : 'Fluktuatif'}
                        </Badge>
                      </TableCell>
                      <TableCell>{r.battery_level}%</TableCell>
                      <TableCell className="text-right">{r.temperature_celsius}°C</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={draft != null} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{draft?.id ? 'Ubah Timbangan' : 'Daftarkan Timbangan'}</DialogTitle>
            <DialogDescription>
              ID alat harus unik dan sesuai identitas perangkat fisik.
            </DialogDescription>
          </DialogHeader>

          {draft ? (
            <div className="space-y-4">
              <Field label="ID Alat">
                <Input
                  value={draft.unique_scale_id}
                  onChange={(e) => setDraft({ ...draft, unique_scale_id: e.target.value })}
                  placeholder="SCALE-PPS-004"
                />
              </Field>
              <Field label="Lokasi">
                <Input
                  value={draft.location}
                  onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                  placeholder="Dermaga B - Pos 2"
                />
              </Field>
              <Field label="Kalibrasi Terakhir">
                <Input
                  type="date"
                  value={draft.last_calibrated_at?.slice(0, 10) ?? ''}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      last_calibrated_at: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : undefined,
                    })
                  }
                />
              </Field>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5">
                <span className="text-sm text-gray-700">Perangkat online</span>
                <Switch
                  checked={draft.status === 1}
                  onCheckedChange={(v) => setDraft({ ...draft, status: v ? 1 : 0 })}
                />
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>
              Batal
            </Button>
            <Button onClick={handleSave}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
