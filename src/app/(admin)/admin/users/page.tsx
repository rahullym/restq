'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { RestaurantRole } from '@prisma/client'

interface User {
  id: string
  name: string
  email: string
  status: string
  role: RestaurantRole
  createdAt: string
}

export default function UsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }

    // Get selected restaurant from cookie
    const restaurantId = document.cookie
      .split('; ')
      .find((row) => row.startsWith('selectedRestaurantId='))
      ?.split('=')[1]

    if (!restaurantId) {
      router.push('/admin/select-restaurant')
      return
    }

    setSelectedRestaurantId(restaurantId)
    fetchUsers(restaurantId)
  }, [status, router])

  const fetchUsers = async (restaurantId: string) => {
    try {
      const response = await fetch(`/api/admin/${restaurantId}/users`)
      const data = await response.json()

      if (data.success) {
        setUsers(data.data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as RestaurantRole

    if (!selectedRestaurantId) return

    try {
      const response = await fetch(`/api/admin/${selectedRestaurantId}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      })

      const data = await response.json()

      if (data.success) {
        setShowAddForm(false)
        fetchUsers(selectedRestaurantId)
        e.currentTarget.reset()
      } else {
        alert(data.error || 'Failed to add user')
      }
    } catch (error) {
      console.error('Error adding user:', error)
      alert('An error occurred. Please try again.')
    }
  }

  const handleUpdateRole = async (userId: string, newRole: RestaurantRole) => {
    if (!selectedRestaurantId) return

    try {
      const response = await fetch(`/api/admin/${selectedRestaurantId}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      const data = await response.json()

      if (data.success) {
        fetchUsers(selectedRestaurantId)
      } else {
        alert(data.error || 'Failed to update user role')
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('An error occurred. Please try again.')
    }
  }

  const handleRemoveUser = async (userId: string) => {
    if (!selectedRestaurantId) return
    if (!confirm('Are you sure you want to remove this user from the restaurant?')) return

    try {
      const response = await fetch(`/api/admin/${selectedRestaurantId}/users/${userId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        fetchUsers(selectedRestaurantId)
      } else {
        alert(data.error || 'Failed to remove user')
      }
    } catch (error) {
      console.error('Error removing user:', error)
      alert('An error occurred. Please try again.')
    }
  }

  const getRoleBadgeColor = (role: RestaurantRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800'
      case 'RESTAURANT_ADMIN':
        return 'bg-blue-100 text-blue-800'
      case 'STAFF':
        return 'bg-green-100 text-green-800'
      case 'VIEW_ONLY':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  // Check if user has RESTAURANT_ADMIN or SUPER_ADMIN role
  const userRole = selectedRestaurantId
    ? session?.user.restaurantMappings.find((m) => m.restaurantId === selectedRestaurantId)?.role
    : null

  const canManageUsers =
    userRole === 'RESTAURANT_ADMIN' || userRole === 'SUPER_ADMIN'

  if (!canManageUsers) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-yellow-900 mb-2">Insufficient Permissions</h2>
          <p className="text-yellow-800">
            You need RESTAURANT_ADMIN or SUPER_ADMIN role to manage users.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">Manage users for this restaurant</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
        >
          {showAddForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Add User</h2>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                name="role"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="STAFF">Staff</option>
                <option value="RESTAURANT_ADMIN">Restaurant Admin</option>
                <option value="VIEW_ONLY">View Only</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Add User
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => handleUpdateRole(user.id, e.target.value as RestaurantRole)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    <option value="VIEW_ONLY">View Only</option>
                    <option value="STAFF">Staff</option>
                    <option value="RESTAURANT_ADMIN">Restaurant Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleRemoveUser(user.id)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
