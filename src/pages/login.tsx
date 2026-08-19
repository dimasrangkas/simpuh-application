import { Fish, Loader2, LogIn } from 'lucide-react'
import { useState } from 'react'

import { useAuth } from '@/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field, Input } from '@/components/ui/input'
import { DEFAULT_CONFIG } from '@/data/config'

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await login(email, password)
    if (!result.ok) setError(result.error ?? 'Gagal masuk.')
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 rounded-xl bg-primary p-3">
            <Fish className="size-7 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-hi">SIMPUH</h1>
          <p className="mt-1 text-sm text-mid">
            Sistem Mutu &amp; Penimbangan Hasil Laut
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Email">
              <Input
                type="email"
                autoComplete="username"
                placeholder="nama@pps.kkp.go.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>

            <Field label="Kata Sandi">
              <Input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>

            {error ? (
              <p className="rounded-md bg-danger/8 px-3 py-2 text-sm text-danger">{error}</p>
            ) : null}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="animate-spin" /> : <LogIn />}
              {loading ? 'Memproses…' : 'Masuk'}
            </Button>
          </form>

          <div className="mt-5 rounded-md bg-bg px-3 py-2.5">
            <p className="mb-1 text-xs font-medium text-mid">Akun demo</p>
            <p className="text-xs text-mid">
              <code className="text-mid">agus@kapal.com</code> — Pemilik Kapal (3 kapal, data
              terlengkap) + Pembeli
              <br />
              <code className="text-mid">hendra@kapal.com</code> — Pemilik Kapal (2 kapal)
              <br />
              <code className="text-mid">budi@pps.kkp.go.id</code> — Petugas PPS
              <br />
              <code className="text-mid">buyer@majujaya.com</code> — Pembeli
              <br />
              <code className="text-mid">admin@pps.kkp.go.id</code> — Admin, bisa switch semua
              peran
              <br />
              Kata sandi: <code className="text-mid">simpuh123</code>
            </p>
          </div>
        </Card>

        <p className="mt-6 text-center text-xs text-low">
          {DEFAULT_CONFIG.organization_name} — {DEFAULT_CONFIG.organization_subtitle}
        </p>
      </div>
    </div>
  )
}
