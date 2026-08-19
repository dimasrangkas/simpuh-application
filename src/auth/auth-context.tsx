import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { USERS } from '@/data/mock'
import type { Role, User } from '@/types'

/**
 * Autentikasi.
 *
 * Login sungguhan tetap ada; role switcher dipertahankan sebagai cara
 * berpindah context SETELAH login — bukan penggantinya. Satu akun bisa
 * memegang beberapa peran, dan satu perangkat di lapangan bisa dipakai
 * bergantian oleh beberapa petugas.
 *
 * CATATAN KEAMANAN: verifikasi kredensial di sini masih di sisi klien karena
 * backend belum ada. Saat API siap, ganti isi `login()` dengan panggilan
 * `POST /auth/login` dan simpan token — role yang dipakai UI HARUS selalu
 * divalidasi ulang di server pada setiap request. Penegakan role di klien
 * hanya untuk kenyamanan tampilan, bukan pengaman.
 */

const SESSION_KEY = 'simpuh.session'

/**
 * Peran tambahan yang dipegang akun tertentu, di luar `user.role` utamanya.
 *
 * Catatan: halaman Pemilik Kapal selalu dibatasi kapal milik akun yang login.
 * Akun yang tidak punya kapal (mis. Admin) memang akan melihat tampilan kosong
 * di sana — itu perilaku yang benar, bukan bug.
 */
const EXTRA_ROLES: Record<number, Role[]> = {
  5: ['PPS_OFFICER', 'SHIP_OWNER', 'BUYER'], // Admin dapat meninjau semua context
  2: ['BUYER'], // Agus juga terdaftar sebagai pembeli
}

interface Session {
  userId: number
  activeRole: Role
}

interface AuthContextValue {
  user: User | null
  activeRole: Role | null
  availableRoles: Role[]
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  switchRole: (role: Role) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function rolesFor(user: User): Role[] {
  return Array.from(new Set<Role>([user.role, ...(EXTRA_ROLES[user.id] ?? [])]))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)

  // Pulihkan sesi setelah refresh halaman.
  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as Session
      if (USERS.some((u) => u.id === parsed.userId)) setSession(parsed)
    } catch {
      localStorage.removeItem(SESSION_KEY)
    }
  }, [])

  const persist = useCallback((next: Session | null) => {
    setSession(next)
    if (next) localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    else localStorage.removeItem(SESSION_KEY)
  }, [])

  const login = useCallback<AuthContextValue['login']>(
    async (email, password) => {
      await new Promise((r) => setTimeout(r, 500))

      const found = USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
      if (!found) return { ok: false, error: 'Email tidak terdaftar.' }
      if (found.is_active === false) return { ok: false, error: 'Akun ini dinonaktifkan.' }
      // Kata sandi demo — diganti verifikasi server saat backend siap.
      if (password !== 'simpuh123') return { ok: false, error: 'Kata sandi salah.' }

      persist({ userId: found.id, activeRole: found.role })
      return { ok: true }
    },
    [persist],
  )

  const logout = useCallback(() => persist(null), [persist])

  const user = useMemo(() => USERS.find((u) => u.id === session?.userId) ?? null, [session])
  const availableRoles = useMemo(() => (user ? rolesFor(user) : []), [user])

  const switchRole = useCallback(
    (role: Role) => {
      if (!session || !user || !rolesFor(user).includes(role)) return
      persist({ ...session, activeRole: role })
    },
    [session, user, persist],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      activeRole: session?.activeRole ?? null,
      availableRoles,
      isAuthenticated: Boolean(user),
      login,
      logout,
      switchRole,
    }),
    [user, session, availableRoles, login, logout, switchRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>')
  return ctx
}
