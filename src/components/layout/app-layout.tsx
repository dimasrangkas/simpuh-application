import { ChevronDown, Fish, LogOut, Menu, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { useAuth } from '@/auth/auth-context'
import { NAV_BY_ROLE, ROLE_LABEL, type PageId } from '@/auth/permissions'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DEFAULT_CONFIG } from '@/data/config'
import { cn } from '@/lib/utils'
import type { Role } from '@/types'

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
  const [mobileOpen, setMobileOpen] = useState(false)

  const nav = NAV_BY_ROLE[currentRole] ?? NAV_BY_ROLE.PPS_OFFICER

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-gray-200 px-5 py-4">
        <div className="rounded-lg bg-blue-600 p-1.5">
          <Fish className="size-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">SIMPUH</p>
          <p className="truncate text-xs text-gray-500">Mutu &amp; Penimbangan Hasil Laut</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {nav.map((item) => {
          const Icon = item.icon
          const active = currentPage === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onPageChange(item.id)
                setMobileOpen(false)
              }}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100',
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-gray-200 px-5 py-3">
        <p className="text-xs text-gray-500">
          {DEFAULT_CONFIG.organization_name}
          <br />
          {DEFAULT_CONFIG.organization_subtitle}
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-gray-200 bg-white lg:block">
        {sidebar}
      </aside>

      {/* Sidebar mobile */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
            <button
              type="button"
              className="absolute top-4 right-3 text-gray-400 hover:text-gray-700"
              onClick={() => setMobileOpen(false)}
            >
              <X className="size-4" />
            </button>
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Buka menu"
              >
                <Menu />
              </Button>
              <p className="text-sm font-medium text-gray-900">
                {nav.find((n) => n.id === currentPage)?.label ?? 'SIMPUH'}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm transition-colors hover:bg-gray-50"
                >
                  <span className="flex size-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                    {user?.name.charAt(0) ?? '?'}
                  </span>
                  <span className="hidden text-left sm:block">
                    <span className="block text-xs leading-tight font-medium text-gray-900">
                      {user?.name}
                    </span>
                    <span className="block text-xs leading-tight text-gray-500">
                      {ROLE_LABEL[currentRole]}
                    </span>
                  </span>
                  <ChevronDown className="size-4 text-gray-500" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <span className="block text-sm font-medium text-gray-900">{user?.name}</span>
                  <span className="block text-xs font-normal text-gray-500">{user?.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuLabel className="text-xs text-gray-500">Ganti Peran</DropdownMenuLabel>
                {availableRoles.map((role) => (
                  <DropdownMenuItem
                    key={role}
                    onSelect={() => onRoleChange(role)}
                    className={cn(currentRole === role && 'bg-blue-50 text-blue-700')}
                  >
                    {ROLE_LABEL[role]}
                    {currentRole === role ? (
                      <span className="ml-auto text-xs text-blue-600">Aktif</span>
                    ) : null}
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={logout} className="text-red-600 focus:bg-red-50">
                  <LogOut className="size-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
