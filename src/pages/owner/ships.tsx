import { Anchor, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
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
import { CREW_TAG_COLORS, crewTagHex, formatDateTime, formatKg, statusColor, statusLabel } from '@/lib/format'
import { useAppStore } from '@/store/app-store'
import type { Crew, CrewTagColor, Ship } from '@/types'

type ShipDraft = { id?: number; vessel_name: string; vessel_code: string; capacity_ton: number }
type CrewDraft = { id?: number; name: string; identification_number: string; crew_tag_color: CrewTagColor }

const EMPTY_SHIP: ShipDraft = { vessel_name: '', vessel_code: '', capacity_ton: 0 }
const EMPTY_CREW: CrewDraft = { name: '', identification_number: '', crew_tag_color: 'Merah' }

export function ShipsPage({ ownerUserId }: { ownerUserId: number }) {
  const { ships, crews, landings, weighings, saveShip, deleteShip, saveCrew, deleteCrew } =
    useAppStore()

  const myShips = ships.filter((s) => s.owner_user_id === ownerUserId)
  const [selectedShipId, setSelectedShipId] = useState<number | null>(myShips[0]?.id ?? null)
  const [shipDraft, setShipDraft] = useState<ShipDraft | null>(null)
  const [crewDraft, setCrewDraft] = useState<CrewDraft | null>(null)

  const selectedShip = myShips.find((s) => s.id === selectedShipId) ?? null
  const shipCrews = crews.filter((c) => c.ship_id === selectedShipId)
  const shipLandings = landings.filter((l) => l.ship_id === selectedShipId)

  function handleSaveShip() {
    if (!shipDraft) return
    if (!shipDraft.vessel_name.trim() || !shipDraft.vessel_code.trim()) {
      toast.error('Nama dan nomor registrasi kapal wajib diisi.')
      return
    }
    saveShip({ ...shipDraft, owner_user_id: ownerUserId })
    toast.success(shipDraft.id ? 'Data kapal diperbarui' : 'Kapal ditambahkan')
    setShipDraft(null)
  }

  function handleSaveCrew() {
    if (!crewDraft || selectedShipId == null) return
    if (!crewDraft.name.trim()) {
      toast.error('Nama ABK wajib diisi.')
      return
    }
    const clash = shipCrews.find(
      (c) => c.crew_tag_color === crewDraft.crew_tag_color && c.id !== crewDraft.id,
    )
    if (clash) {
      toast.error(`Tag ${crewDraft.crew_tag_color} sudah dipakai ${clash.name}.`)
      return
    }
    saveCrew({ ...crewDraft, ship_id: selectedShipId } as Omit<Crew, 'id'> & { id?: number })
    toast.success(crewDraft.id ? 'Data ABK diperbarui' : 'ABK ditambahkan')
    setCrewDraft(null)
  }

  function handleDeleteShip(ship: Ship) {
    const used = weighings.some((w) =>
      landings.some((l) => l.id === w.landing_id && l.ship_id === ship.id),
    )
    if (used) {
      toast.error('Kapal tidak bisa dihapus', {
        description: 'Sudah punya riwayat penimbangan. Nonaktifkan saja.',
      })
      return
    }
    deleteShip(ship.id)
    crews.filter((c) => c.ship_id === ship.id).forEach((c) => deleteCrew(c.id))
    if (selectedShipId === ship.id) setSelectedShipId(null)
    toast.success('Kapal dihapus')
  }

  return (
    <div>
      <PageHeader
        title="Data Kapal"
        description="Kelola kapal, ABK terdaftar, dan riwayat pendaratan"
        actions={
          <Button onClick={() => setShipDraft(EMPTY_SHIP)}>
            <Plus /> Tambah Kapal
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kapal</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Kapal</TableHead>
                <TableHead>No. Registrasi</TableHead>
                <TableHead>Kapasitas</TableHead>
                <TableHead>ABK</TableHead>
                <TableHead>Pendaratan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myShips.length === 0 ? (
                <TableEmpty colSpan={6}>Belum ada kapal terdaftar.</TableEmpty>
              ) : (
                myShips.map((s) => (
                  <TableRow
                    key={s.id}
                    className={selectedShipId === s.id ? 'bg-blue-50 hover:bg-blue-50' : undefined}
                  >
                    <TableCell>
                      <button
                        type="button"
                        className="font-medium text-gray-900 hover:text-blue-600"
                        onClick={() => setSelectedShipId(s.id)}
                      >
                        {s.vessel_name}
                      </button>
                    </TableCell>
                    <TableCell>{s.vessel_code}</TableCell>
                    <TableCell>{s.capacity_ton} Ton</TableCell>
                    <TableCell>{crews.filter((c) => c.ship_id === s.id).length} orang</TableCell>
                    <TableCell>{landings.filter((l) => l.ship_id === s.id).length}x</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setShipDraft({
                              id: s.id,
                              vessel_name: s.vessel_name,
                              vessel_code: s.vessel_code,
                              capacity_ton: s.capacity_ton,
                            })
                          }
                        >
                          <Pencil />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteShip(s)}
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

      {selectedShip ? (
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="size-4 text-gray-500" />
                ABK — {selectedShip.vessel_name}
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => setCrewDraft(EMPTY_CREW)}>
                <Plus /> Tambah ABK
              </Button>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>NIK</TableHead>
                    <TableHead>Tag</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipCrews.length === 0 ? (
                    <TableEmpty colSpan={4}>Belum ada ABK terdaftar.</TableEmpty>
                  ) : (
                    shipCrews.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium text-gray-900">{c.name}</TableCell>
                        <TableCell className="text-xs">{c.identification_number}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className="size-3 rounded-full border border-gray-300"
                              style={{ backgroundColor: crewTagHex(c.crew_tag_color) }}
                            />
                            {c.crew_tag_color}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setCrewDraft({
                                  id: c.id,
                                  name: c.name,
                                  identification_number: c.identification_number,
                                  crew_tag_color: c.crew_tag_color,
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
                                deleteCrew(c.id)
                                toast.success('ABK dihapus')
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Anchor className="size-4 text-gray-500" />
                Riwayat Pendaratan
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Petugas</TableHead>
                    <TableHead>Total Berat</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipLandings.length === 0 ? (
                    <TableEmpty colSpan={4}>Belum ada riwayat pendaratan.</TableEmpty>
                  ) : (
                    shipLandings.map((l) => {
                      const total = weighings
                        .filter((w) => w.landing_id === l.id && !w.is_voided)
                        .reduce((sum, w) => sum + w.weight_kg, 0)
                      return (
                        <TableRow key={l.id}>
                          <TableCell>{formatDateTime(l.landing_date)}</TableCell>
                          <TableCell>{l.officer.name}</TableCell>
                          <TableCell className="font-medium">{formatKg(total)}</TableCell>
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
      ) : null}

      {/* Dialog kapal */}
      <Dialog open={shipDraft != null} onOpenChange={(o) => !o && setShipDraft(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{shipDraft?.id ? 'Ubah Kapal' : 'Tambah Kapal'}</DialogTitle>
            <DialogDescription>Data kapal dipakai di seluruh alur pendaratan.</DialogDescription>
          </DialogHeader>

          {shipDraft ? (
            <div className="space-y-4">
              <Field label="Nama Kapal">
                <Input
                  value={shipDraft.vessel_name}
                  onChange={(e) => setShipDraft({ ...shipDraft, vessel_name: e.target.value })}
                  placeholder="KM Mina Jaya 01"
                />
              </Field>
              <Field label="Nomor Registrasi">
                <Input
                  value={shipDraft.vessel_code}
                  onChange={(e) => setShipDraft({ ...shipDraft, vessel_code: e.target.value })}
                  placeholder="MJ-001"
                />
              </Field>
              <Field label="Kapasitas (Ton)">
                <Input
                  type="number"
                  min={0}
                  value={shipDraft.capacity_ton}
                  onChange={(e) =>
                    setShipDraft({ ...shipDraft, capacity_ton: Number(e.target.value) })
                  }
                />
              </Field>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShipDraft(null)}>
              Batal
            </Button>
            <Button onClick={handleSaveShip}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog ABK */}
      <Dialog open={crewDraft != null} onOpenChange={(o) => !o && setCrewDraft(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{crewDraft?.id ? 'Ubah ABK' : 'Tambah ABK'}</DialogTitle>
            <DialogDescription>
              Tiap ABK memakai satu warna tag unik dalam satu kapal.
            </DialogDescription>
          </DialogHeader>

          {crewDraft ? (
            <div className="space-y-4">
              <Field label="Nama ABK">
                <Input
                  value={crewDraft.name}
                  onChange={(e) => setCrewDraft({ ...crewDraft, name: e.target.value })}
                />
              </Field>
              <Field label="NIK">
                <Input
                  value={crewDraft.identification_number}
                  onChange={(e) =>
                    setCrewDraft({ ...crewDraft, identification_number: e.target.value })
                  }
                  placeholder="3301010101010001"
                />
              </Field>
              <Field label="Warna Tag">
                <Select
                  value={crewDraft.crew_tag_color}
                  onValueChange={(v) =>
                    setCrewDraft({ ...crewDraft, crew_tag_color: v as CrewTagColor })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CREW_TAG_COLORS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Badge variant="secondary">
                Tag terpakai: {shipCrews.map((c) => c.crew_tag_color).join(', ') || '—'}
              </Badge>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setCrewDraft(null)}>
              Batal
            </Button>
            <Button onClick={handleSaveCrew}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
