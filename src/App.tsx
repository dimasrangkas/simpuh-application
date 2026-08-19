import { useCallback, useState } from 'react'
import { Toaster } from 'sonner'

import { AuthProvider, useAuth } from '@/auth/auth-context'
import { canAccess, landingPageFor, type PageId } from '@/auth/permissions'
import { AppLayout } from '@/components/layout/app-layout'
import { AdminDashboard } from '@/pages/admin/dashboard'
import { ScalesPage } from '@/pages/admin/scales'
import { SettingsPage } from '@/pages/admin/settings'
import { UsersPage } from '@/pages/admin/users'
import { BuyerDashboard } from '@/pages/buyer/dashboard'
import { InvoicesPage } from '@/pages/buyer/invoices'
import { PurchasePage } from '@/pages/buyer/purchase'
import { LoginPage } from '@/pages/login'
import { CrewReportPage } from '@/pages/owner/crew-report'
import { OwnerDashboard } from '@/pages/owner/dashboard'
import { ShipsPage } from '@/pages/owner/ships'
import { TagAbkPage } from '@/pages/owner/tag-abk'
import { PpsDashboard } from '@/pages/pps/dashboard'
import { MorphologyPage } from '@/pages/pps/morphology'
import { ReportsPage } from '@/pages/pps/reports'
import { WeighingPage } from '@/pages/pps/weighing'
import { AppStoreProvider } from '@/store/app-store'
import type { Role } from '@/types'

function AuthenticatedApp() {
  const { activeRole, switchRole, user } = useAuth()
  const role = (activeRole ?? 'PPS_OFFICER') as Role
  const userId = user?.id ?? 0

  const [page, setPage] = useState<PageId>(() => landingPageFor(role))
  const [landingId, setLandingId] = useState<number | null>(null)

  const goTo = useCallback((next: PageId) => {
    setPage(next)
    setLandingId(null)
  }, [])

  const handleRoleChange = useCallback(
    (next: Role) => {
      switchRole(next)
      setPage(landingPageFor(next))
      setLandingId(null)
    },
    [switchRole],
  )

  const backToDashboard = useCallback(() => {
    setPage(landingPageFor(role))
    setLandingId(null)
  }, [role])

  const startWeighing = useCallback((id: number) => {
    setLandingId(id)
    setPage('weighing')
  }, [])

  // Guard: role tidak boleh membuka halaman di luar haknya.
  const safePage = canAccess(role, page) ? page : landingPageFor(role)

  function renderPage() {
    switch (safePage) {
      // Petugas PPS
      case 'dashboard-pps':
        return <PpsDashboard onStartWeighing={startWeighing} />
      case 'weighing':
        return landingId != null ? (
          <WeighingPage landingId={landingId} onBack={backToDashboard} />
        ) : (
          <PpsDashboard onStartWeighing={startWeighing} />
        )
      case 'morphology':
        return <MorphologyPage />
      case 'reports-pps':
        return <ReportsPage />

      // Pemilik Kapal
      case 'dashboard-owner':
        return <OwnerDashboard ownerUserId={userId} onTagABK={() => setPage('tag-abk')} />
      case 'tag-abk':
        return <TagAbkPage ownerUserId={userId} onBack={backToDashboard} />
      case 'crew-report':
        return <CrewReportPage ownerUserId={userId} />
      case 'ships':
        return <ShipsPage ownerUserId={userId} />

      // Pembeli
      case 'dashboard-buyer':
        return <BuyerDashboard buyerUserId={userId} onPurchase={() => setPage('purchase')} />
      case 'purchase':
        return (
          <PurchasePage
            buyerUserId={userId}
            onBack={backToDashboard}
            onDone={() => setPage('invoices')}
          />
        )
      case 'invoices':
        return <InvoicesPage buyerUserId={userId} />

      // Admin
      case 'dashboard-admin':
        return <AdminDashboard />
      case 'users':
        return <UsersPage currentUserId={userId} />
      case 'scales':
        return <ScalesPage />
      case 'settings':
        return <SettingsPage />

      default:
        return <p className="text-gray-600">Halaman tidak ditemukan.</p>
    }
  }

  return (
    <AppLayout
      currentRole={role}
      currentPage={safePage}
      onPageChange={goTo}
      onRoleChange={handleRoleChange}
    >
      {renderPage()}
    </AppLayout>
  )
}

function Root() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <AuthenticatedApp /> : <LoginPage />
}

export default function App() {
  return (
    <AuthProvider>
      <AppStoreProvider>
        <Root />
        <Toaster position="top-right" richColors />
      </AppStoreProvider>
    </AuthProvider>
  )
}
