import { Info, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { ALL_ROLES, NAV_BY_ROLE, ROLE_LABEL } from '@/auth/permissions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/misc'
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
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CREW_TAG_COLORS, formatIDR } from '@/lib/format'
import { useAppStore } from '@/store/app-store'
import type { FishCategory } from '@/types'

type CategoryDraft = {
  id?: number
  category_name: string
  pnbp_rate: number
  price_per_kg: number
  color: string
}

const EMPTY: CategoryDraft = {
  category_name: '',
  pnbp_rate: 0,
  price_per_kg: 0,
  color: '#3b82f6',
}

export function SettingsPage() {
  const { categories, config, saveCategory, deleteCategory, updateConfig } = useAppStore()
  const [draft, setDraft] = useState<CategoryDraft | null>(null)

  function handleSave() {
    if (!draft) return
    if (!draft.category_name.trim()) {
      toast.error('Nama kategori wajib diisi.')
      return
    }
    saveCategory(draft as Omit<FishCategory, 'id'> & { id?: number })
    toast.success(draft.id ? 'Kategori diperbarui' : 'Kategori ditambahkan')
    setDraft(null)
  }

  return (
    <div>
      <PageHeader title="Pengaturan Sistem" description="Konfigurasi harga, PNBP, tag ABK, dan hak akses" />

      <Tabs defaultValue="pricing">
        <TabsList>
          <TabsTrigger value="pricing">Harga &amp; PNBP</TabsTrigger>
          <TabsTrigger value="tags">Tag ABK</TabsTrigger>
          <TabsTrigger value="roles">Hak Akses</TabsTrigger>
          <TabsTrigger value="org">Organisasi</TabsTrigger>
        </TabsList>

        {/* Harga & PNBP */}
        <TabsContent value="pricing" className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Formula PNBP</CardTitle>
              <CardDescription>
                Versi demo. Formula resmi menyusul — perubahan cukup di satu tempat.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                <Info className="mt-0.5 size-4 shrink-0 text-blue-600" />
                <p className="text-sm text-blue-900">
                  Seluruh perhitungan PNBP di aplikasi memakai satu fungsi terpusat
                  (<code className="text-xs">calculatePNBP</code>). Mengubah metode di sini langsung
                  berlaku di dashboard, laporan, dan invoice.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Metode Perhitungan">
                  <Select
                    value={config.pnbp_method}
                    onValueChange={(v) =>
                      updateConfig({ pnbp_method: v as typeof config.pnbp_method })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per_kg_rate">Tarif per Kg per kategori</SelectItem>
                      <SelectItem value="percent_of_value">Persentase dari nilai transaksi</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                {config.pnbp_method === 'percent_of_value' ? (
                  <Field label="Persentase PNBP (%)">
                    <Input
                      type="number"
                      step="0.1"
                      min={0}
                      value={config.pnbp_percent}
                      onChange={(e) => updateConfig({ pnbp_percent: Number(e.target.value) })}
                    />
                  </Field>
                ) : null}

                <Field label="Biaya Penanganan (%)" hint="Ditambahkan ke setiap invoice pembelian.">
                  <Input
                    type="number"
                    step="0.1"
                    min={0}
                    value={config.handling_fee_percent}
                    onChange={(e) => updateConfig({ handling_fee_percent: Number(e.target.value) })}
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Kategori Ikan</CardTitle>
                <CardDescription>Harga jual dan tarif PNBP per kategori.</CardDescription>
              </div>
              <Button size="sm" onClick={() => setDraft(EMPTY)}>
                <Plus /> Tambah
              </Button>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Harga / Kg</TableHead>
                    <TableHead>Tarif PNBP / Kg</TableHead>
                    <TableHead>Warna</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium text-gray-900">{c.category_name}</TableCell>
                      <TableCell>{formatIDR(c.price_per_kg ?? 0)}</TableCell>
                      <TableCell>{formatIDR(c.pnbp_rate)}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="size-3 rounded-full border border-gray-300"
                            style={{ backgroundColor: c.color }}
                          />
                          <code className="text-xs">{c.color}</code>
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setDraft({
                                id: c.id,
                                category_name: c.category_name,
                                pnbp_rate: c.pnbp_rate,
                                price_per_kg: c.price_per_kg ?? 0,
                                color: c.color,
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
                              deleteCategory(c.id)
                              toast.success('Kategori dihapus')
                            }}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tag ABK */}
        <TabsContent value="tags">
          <Card>
            <CardHeader>
              <CardTitle>Manajemen Tag Warna ABK</CardTitle>
              <CardDescription>
                Warna yang tersedia saat mendaftarkan ABK. Urutan mengikuti daftar di bawah.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {CREW_TAG_COLORS.map((c, i) => (
                  <div
                    key={c.value}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"
                  >
                    <span
                      className="size-6 shrink-0 rounded-full border border-gray-300"
                      style={{ backgroundColor: c.color }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">{c.value}</p>
                      <p className="text-xs text-gray-500">Urutan {i + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hak akses */}
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Peran &amp; Hak Akses</CardTitle>
              <CardDescription>
                Menu yang bisa diakses tiap peran. Penegakan di UI mengikuti daftar ini; validasi
                ulang tetap wajib di sisi server saat backend terpasang.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ALL_ROLES.map((role) => (
                <div key={role} className="rounded-lg border border-gray-200 p-4">
                  <p className="mb-2 text-sm font-medium text-gray-900">{ROLE_LABEL[role]}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {NAV_BY_ROLE[role].map((item) => (
                      <Badge key={item.id} variant="secondary">
                        {item.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organisasi */}
        <TabsContent value="org">
          <Card>
            <CardHeader>
              <CardTitle>Identitas Organisasi</CardTitle>
              <CardDescription>Tampil di sidebar, halaman login, dan cetakan invoice.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Nama Organisasi">
                <Input
                  value={config.organization_name}
                  onChange={(e) => updateConfig({ organization_name: e.target.value })}
                />
              </Field>
              <Field label="Subtitle">
                <Input
                  value={config.organization_subtitle}
                  onChange={(e) => updateConfig({ organization_subtitle: e.target.value })}
                />
              </Field>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={draft != null} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{draft?.id ? 'Ubah Kategori' : 'Tambah Kategori'}</DialogTitle>
          </DialogHeader>

          {draft ? (
            <div className="space-y-4">
              <Field label="Nama Kategori">
                <Input
                  value={draft.category_name}
                  onChange={(e) => setDraft({ ...draft, category_name: e.target.value })}
                  placeholder="Ikan Kembung"
                />
              </Field>
              <Field label="Harga Jual per Kg (Rp)">
                <Input
                  type="number"
                  min={0}
                  value={draft.price_per_kg}
                  onChange={(e) => setDraft({ ...draft, price_per_kg: Number(e.target.value) })}
                />
              </Field>
              <Field label="Tarif PNBP per Kg (Rp)">
                <Input
                  type="number"
                  min={0}
                  value={draft.pnbp_rate}
                  onChange={(e) => setDraft({ ...draft, pnbp_rate: Number(e.target.value) })}
                />
              </Field>
              <Field label="Warna">
                <Input
                  type="color"
                  className="h-9 w-20 p-1"
                  value={draft.color}
                  onChange={(e) => setDraft({ ...draft, color: e.target.value })}
                />
              </Field>
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
