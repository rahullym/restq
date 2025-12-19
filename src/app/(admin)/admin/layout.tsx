import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import AdminNav from '@/components/admin/AdminNav'
import AdminLayoutClient from '@/components/admin/AdminLayoutClient'
import AdminHeader from '@/components/admin/AdminHeader'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/admin/login')
  }

  const restaurantMappings = session.user.restaurantMappings

  if (restaurantMappings.length === 0) {
    // No restaurants assigned
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Restaurants</h2>
          <p className="text-gray-600">
            You don't have access to any restaurants. Please contact your administrator.
          </p>
        </div>
      </div>
    )
  }

  // Get selected restaurant from session (preferred) or use first restaurant
  let selectedRestaurantId = session.selectedRestaurantId

  // Auto-select if only one restaurant and none selected
  if (restaurantMappings.length === 1 && !selectedRestaurantId) {
    selectedRestaurantId = restaurantMappings[0].restaurantId
  }

  // Validate that the selected restaurant (if any) is one the user can access
  if (selectedRestaurantId) {
    const hasAccess = restaurantMappings.some(
      (m) => m.restaurantId === selectedRestaurantId
    )
    if (!hasAccess) {
      selectedRestaurantId = undefined
    }
  }

  return (
    <AdminLayoutClient
      sidebar={
        <AdminNav
          userEmail={session.user.email || ''}
          restaurantMappings={restaurantMappings}
          selectedRestaurantId={selectedRestaurantId || undefined}
        />
      }
    >
      {/* Top Bar - Simplified for Mobile */}
      <AdminHeader />

      {/* Page Content */}
      <main className="p-2 sm:p-4">
        <div className="w-full max-w-full">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-6">
        <div className="px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600">
            <div>
              <p>© 2025 RESq. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-indigo-600 transition-colors">Help</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Documentation</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </AdminLayoutClient>
  )
}
