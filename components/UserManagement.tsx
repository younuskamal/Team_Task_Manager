'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  name: string
  email: string
  role: string
  createdAt: string
  _count: {
    tasks: number
    sentMessages: number
  }
}

interface UserManagementProps {
  users: User[]
  currentUser: {
    id: number
    role: string
  }
}

export default function UserManagement({ users, currentUser }: UserManagementProps) {
  const [loading, setLoading] = useState<number | null>(null)
  const router = useRouter()

  const handleRoleChange = async (userId: number, newRole: string) => {
    if (userId === currentUser.id) {
      alert('Kendi rolünüzü değiştiremezsiniz')
      return
    }

    setLoading(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Rol değiştirilirken bir hata oluştu')
      }
    } catch (error) {
      alert('Bağlantı hatası')
    } finally {
      setLoading(null)
    }
  }

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (userId === currentUser.id) {
      alert('Kendi hesabınızı silemezsiniz')
      return
    }

    if (!confirm(`${userName} kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return
    }

    setLoading(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Kullanıcı silinirken bir hata oluştu')
      }
    } catch (error) {
      alert('Bağlantı hatası')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Kullanıcı Yönetimi</h2>
        <span className="text-sm text-gray-500">{users.length} kullanıcı</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kullanıcı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İstatistikler
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kayıt Tarihi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className={user.id === currentUser.id ? 'bg-blue-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                      {user.id === currentUser.id && (
                        <span className="ml-2 text-xs text-blue-600">(Siz)</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={user.id === currentUser.id || loading === user.id}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="kullanıcı">Kullanıcı</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    <div>📋 {user._count.tasks} görev</div>
                    <div>💬 {user._count.sentMessages} mesaj</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {user.id !== currentUser.id && (
                    <button
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      disabled={loading === user.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading === user.id ? '⏳' : '🗑️'} Sil
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}