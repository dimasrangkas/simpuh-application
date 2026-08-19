import { ChevronDown, Fish, LogOut, Menu, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'

import { useAuth } from '@/auth/auth-context'
import { NAV_BY_ROLE, ROLE_LABEL, type PageId } from '@/auth/permissions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/store/app-store'
import { cn } from '@/lib/utils'
import type { Role } from '@/types'

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return now
}

export function AppLayout({
  children,
  currentRole,
  currentPage,
  onPageChange,
  onRoleChange,
}: {
  children: ReactNode
  currentRole: Role
  currentPage: PageId
  onPageChange: (page: PageId) => void
  onRoleChange: (role: Role) => void
}) {
  const { user, availableRoles, logout } = useAuth()
  const { config } = useAppStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const now = useClock()

  const nav = NAV_BY_ROLE[currentRole] ?? NAV_BY_ROLE.PPS_OFFICER

  const navList = (
    <nav className="p-3">
      <p className="px-3 pt-3.5 pb-1.5 text-[10px] font-bold tracking-[1.2px] text-low uppercase">
        Menu {ROLE_LABEL[currentRole]}
      </p>
      {nav.map((item) => {
        const Icon = item.icon
        const active = currentPage === item.id
        return (
          <button
            key={item.id}
            type="button"
            aria-current={active ? 'page' : undefined}
            onClick={() => {
              onPageChange(item.id)
              setMobileOpen(false)
            }}
            className={cn(
              'mb-0.5 flex w-full items-center gap-[11px] rounded-[10px] px-3 py-2.5 text-left text-[13.5px] font-semibold transition-colors',
              active
                ? 'bg-gradient-to-br from-primary/9 to-accent/9 text-primary shadow-[inset_0_0_0_1px_rgba(0,119,182,.15)]'
                : 'text-mid hover:bg-bg hover:text-hi',
            )}
          >
            <Icon className="size-[17px] shrink-0" />
            {item.label}
          </button>
        )
      })}
    </nav>
  )

  return (
    <div className="grid min-h-screen grid-rows-[64px_1fr] lg:grid-cols-[236px_1fr]">
      {/* Topbar membentang penuh di atas sidebar */}
      <header className="sticky top-0 z-80 flex items-center justify-between gap-4 border-b border-border bg-card px-4 lg:col-span-2 lg:pr-[22px] lg:pl-[18px]">
        <div className="flex min-w-0 items-center gap-[11px]">
          <button
            type="button"
            className="-ml-1 rounded-lg p-2 text-mid transition-colors hover:bg-bg lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Buka menu"
          >
            <Menu className="size-5" />
          </button>

          <div className="flex size-[38px] shrink-0 items-center justify-center rounded-[11px] bg-gradient-to-br from-primary to-accent">
            <Fish className="size-5 text-white" />
          </div>

          <div className="hidden h-8 w-px shrink-0 bg-border sm:block" />

          <div className="min-w-0">
            <b className="block text-[16.5px] leading-none font-extrabold tracking-tight text-hi">
              SIMPUH
            </b>
            <small className="mt-0.5 hidden text-[9.5px] font-semibold tracking-[1px] text-low uppercase sm:block">
              Mutu &amp; Penimbangan Hasil Laut
            </small>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right text-[12.5px] leading-tight text-mid xl:block">
            <div className="tabular font-semibold text-hi">
              {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-[11px]">
              {now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-[10px] border border-border bg-card px-3 py-1.5 transition-colors hover:bg-bg"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-[11px] font-bold text-white">
                  {user?.name.charAt(0) ?? '?'}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-[12.5px] leading-tight font-bold text-hi">
                    {user?.name}
                  </span>
                  <span className="block text-[10.5px] leading-tight font-medium text-low">
                    {ROLE_LABEL[currentRole]}
                  </span>
                </span>
                <ChevronDown className="size-4 text-low" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>
                <span className="block text-[13px] font-bold text-hi">{user?.name}</span>
                <span className="block text-[11px] font-normal text-low">{user?.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuLabel className="text-[10px] font-bold tracking-[1px] text-low uppercase">
                Ganti Peran
              </DropdownMenuLabel>
              {availableRoles.map((role) => (
                <DropdownMenuItem
                  key={role}
                  onSelect={() => onRoleChange(role)}
                  className={cn(currentRole === role && 'bg-primary/8 font-semibold text-primary')}
                >
                  {ROLE_LABEL[role]}
                  {currentRole === role ? (
                    <span className="ml-auto text-[10px] text-primary">Aktif</span>
                  ) : null}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={logout} className="text-danger focus:bg-danger/8 focus:text-danger">
                <LogOut className="size-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Sidebar desktop */}
      <aside className="sticky top-16 hidden h-[calc(100vh-64px)] flex-col justify-between overflow-y-auto border-r border-border bg-card lg:flex">
        {navList}
        <div className="border-t border-border px-5 py-3.5">
          <p className="text-[10.5px] leading-relaxed text-low">
            <b className="block font-bold text-secondary">{config.organization_name}</b>
            {config.organization_subtitle}
          </p>
        </div>
      </aside>

      {/* Sidebar mobile */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-90 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            className="absolute inset-0 bg-[#102840]/40 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col justify-between bg-card shadow-lift">
            <div>
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <b className="text-[15px] font-extrabold text-hi">SIMPUH</b>
                <button
                  type="button"
                  className="text-low hover:text-hi"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Tutup"
                >
                  <X className="size-4" />
                </button>
              </div>
              {navList}
            </div>
            <div className="border-t border-border px-5 py-3.5">
              <p className="text-[10.5px] leading-relaxed text-low">
                <b className="block font-bold text-secondary">{config.organization_name}</b>
                {config.organization_subtitle}
              </p>
            </div>
          </aside>
        </div>
      ) : null}

      <main className="max-w-[1760px] px-4 pt-6 pb-14 sm:px-6 lg:px-[26px]">{children}</main>
    </div>
  )
}
