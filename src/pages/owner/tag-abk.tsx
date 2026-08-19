import { ArrowLeft, Check, Undo2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { crewTagHex, formatDateTime, formatKg } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'

export function TagAbkPage({ ownerUserId, onBack }: { ownerUserId: number; onBack: () => void }) {
  const { ships, crews, landings, weighings, categories, assignCrewTag } = useAppStore()

  const myShipIds = ships.filter((s) => s.owner_user_id === ownerUserId).map((s) => s.id)
  const myLandingIds = landings.filter((l) => myShipIds.includes(l.ship_id)).map((l) => l.id)
  const myRecords = weighings.filter((w) => myLandingIds.includes(w.landing_id) && !w.is_voided)
  const myCrews = crews.filter((c) => myShipIds.includes(c.ship_id))

  const untagged = myRecords.filter((w) => w.crew_id == null)
  const tagged = myRecords.filter((w) => w.crew_id != null)

  const [selectedCrewId, setSelectedCrewId] = useState<number | null>(myCrews[0]?.id ?? null)

  const totalTaggedWeight = tagged.reduce((sum, w) => sum + w.weight_kg, 0)
  const perCrew = myCrews
    .map((c) => ({
      ...c,
      weight: tagged.filter((w) => w.crew_id === c.id).reduce((sum, w) => sum + w.weight_kg, 0),
    }))
    .sort((a, b) => b.weight - a.weight)

  function categoryName(id: number) {
    return categories.find((c) => c.id === id)?.category_name ?? '—'
  }

  function handleAssign(weighingId: number) {
    if (selectedCrewId == null) {
      toast.error('Pilih ABK terlebih dahulu di panel kanan.')
      return
    }
    assignCrewTag(weighingId, selectedCrewId)
    const crew = myCrews.find((c) => c.id === selectedCrewId)
    toast.success(`Dialokasikan ke ${crew?.name}`)
  }

  return (
    <div>
      <PageHeader
        title="Tag ABK"
        description="Alokasikan hasil tangkapan ke ABK berdasarkan tag warna"
        actions={
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft /> Kembali
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Menunggu Tag ({untagged.length})</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Berat</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {untagged.length === 0 ? (
                    <TableEmpty colSpan={4}>Semua hasil tangkapan sudah ditag.</TableEmpty>
                  ) : (
                    untagged.map((w) => (
                      <TableRow key={w.id}>
                        <TableCell>{formatDateTime(w.weighed_at)}</TableCell>
                        <TableCell>{categoryName(w.fish_category_id)}</TableCell>
                        <TableCell className="font-medium">{formatKg(w.weight_kg)}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => handleAssign(w.id)}>
                            <Check /> Tag
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sudah Ditag ({tagged.length})</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Berat</TableHead>
                    <TableHead>ABK</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tagged.length === 0 ? (
                    <TableEmpty colSpan={5}>Belum ada yang ditag.</TableEmpty>
                  ) : (
                    tagged.map((w) => {
                      const crew = myCrews.find((c) => c.id === w.crew_id)
                      return (
                        <TableRow key={w.id}>
                          <TableCell>{formatDateTime(w.weighed_at)}</TableCell>
                          <TableCell>{categoryName(w.fish_category_id)}</TableCell>
                          <TableCell className="font-medium">{formatKg(w.weight_kg)}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1.5">
                              <span
                                className="size-3 rounded-full border border-gray-300"
                                style={{
                                  backgroundColor: crew ? crewTagHex(crew.crew_tag_color) : '#ccc',
                                }}
                              />
                              {crew?.name ?? '—'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                assignCrewTag(w.id, null)
                                toast.success('Tag dibatalkan')
                              }}
                            >
                              <Undo2 /> Batal
                            </Button>
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

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Pilih ABK</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {myCrews.length === 0 ? (
                <EmptyState
                  icon={Check}
                  title="Belum ada ABK"
                  description="Tambahkan ABK lebih dulu di halaman Data Kapal."
                />
              ) : (
                myCrews.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCrewId(c.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
                      selectedCrewId === c.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50',
                    )}
                  >
                    <span
                      className="size-4 shrink-0 rounded-full border border-gray-300"
                      style={{ backgroundColor: crewTagHex(c.crew_tag_color) }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-gray-900">
                        {c.name}
                      </span>
                      <span className="block text-xs text-gray-500">Tag {c.crew_tag_color}</span>
                    </span>
                    {selectedCrewId === c.id ? (
                      <Badge variant="default" className="shrink-0">
                        Dipilih
                      </Badge>
                    ) : null}
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Berat per ABK</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {perCrew.length === 0 ? (
                <p className="text-sm text-gray-500">Belum ada data.</p>
              ) : (
                perCrew.map((c) => {
                  const percent = totalTaggedWeight ? (c.weight / totalTaggedWeight) * 100 : 0
                  return (
                    <div key={c.id}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="truncate text-gray-700">{c.name}</span>
                        <span className="ml-2 shrink-0 font-medium text-gray-900">
                          {formatKg(c.weight)}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: crewTagHex(c.crew_tag_color),
                          }}
                        />
                      </div>
                      <p className="mt-0.5 text-right text-xs text-gray-400">
                        {percent.toFixed(1)}%
                      </p>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
