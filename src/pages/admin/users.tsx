import { KeyRound, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { ALL_ROLES, ROLE_LABEL } from '@/auth/permissions'
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
import { useAppStore } from '@/store/app-store'
import type { Role } from '@/types'

type UserDraft = { id?: number; name: string; email: string; role: Role; is_active: boolean }

const EMPTY: UserDraft = { name: '', email: '', role: 'PPS_OFFICER', is_active: true }

export function UsersPage({ currentUserId }: { currentUserId: number }) {
  const { users, saveUser, deleteUser } = useAppStore()
  const [draft, setDraft] = useState<UserDraft | null>(null)

  function handleSave() {
    if (!draft) return
    if (!draft.name.trim() || !draft.email.trim()) {
      toast.error('Nama dan email wajib diisi.')
      return
    }
    const clash = users.find(
      (u) => u.email.toLowerCase() === draft.email.trim().toLowerCase() && u.id !== draft.id,
    )
    if (clash) {
      toast.error('Email sudah dipakai pengguna lain.')
      return
    }
    saveUser({ ...draft, email: draft.email.trim() })
    toast.success(draft.id ? 'Pengguna diperbarui' : 'Pengguna ditambahkan')
    setDraft(null)
  }

  return (
    <div>
      <PageHeader
        title="Manajemen Pengguna"
        description="Kelola akun dan peran pengguna sistem"
        actions={
          <Button onClick={() => setDraft(EMPTY)}>
            <Plus /> Tambah Pengguna
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableEmpty colSpan={5}>Belum ada pengguna.</TableEmpty>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium text-gray-900">
                      {u.name}
                      {u.id === currentUserId ? (
                        <Badge variant="secondary" className="ml-2">
                          Anda
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="default">{ROLE_LABEL[u.role]}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.is_active === false ? 'destructive' : 'success'}>
                        {u.is_active === false ? 'Nonaktif' : 'Aktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            toast.success(`Tautan atur ulang kata sandi dikirim ke ${u.email}`)
                          }
                        >
                          <KeyRound />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setDraft({
                              id: u.id,
                              name: u.name,
                              email: u.email,
                              role: u.role,
                              is_active: u.is_active !== false,
                            })
                          }
                        >
                          <Pencil />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50"
                          disabled={u.id === currentUserId}
                          onClick={() => {
                            deleteUser(u.id)
                            toast.success('Pengguna dihapus')
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

      <Dialog open={draft != null} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{draft?.id ? 'Ubah Pengguna' : 'Tambah Pengguna'}</DialogTitle>
            <DialogDescription>
              Peran menentukan menu dan data yang bisa diakses pengguna.
            </DialogDescription>
          </DialogHeader>

          {draft ? (
            <div className="space-y-4">
              <Field label="Nama Lengkap">
                <Input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={draft.email}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                  placeholder="nama@pps.kkp.go.id"
                />
              </Field>
              <Field label="Peran">
                <Select
                  value={draft.role}
                  onValueChange={(v) => setDraft({ ...draft, role: v as Role })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABEL[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5">
                <span className="text-sm text-gray-700">Akun aktif</span>
                <Switch
                  checked={draft.is_active}
                  onCheckedChange={(v) => setDraft({ ...draft, is_active: v })}
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
