'use client'

import { useEffect, useState } from 'react'

interface Log {
  id: number
  action: string
  details: string | null
  createdAt: string
  user?: { name: string | null }
  task?: { title: string }
}

interface UserOption {
  id: number
  name: string
}

interface ActivityLogProps {
  initialLogs: Log[]
  users: UserOption[]
  isAdmin: boolean
}

// Aksiyon bilgileri ve ikonları
const actionInfo: Record<string, { label: string; color: string; icon: string }> = {
  LOGIN: { label: 'Kullanıcı Giriş Yaptı', color: 'bg-green-100 text-green-800', icon: '🔑' },
  LOGOUT: { label: 'Kullanıcı Çıkış Yaptı', color: 'bg-gray-100 text-gray-800', icon: '🚪' },
  TASK_CREATED: { label: 'Görev Oluşturuldu', color: 'bg-blue-100 text-blue-800', icon: '🆕' },
  TASK_UPDATED: { label: 'Görev Güncellendi', color: 'bg-yellow-100 text-yellow-800', icon: '✏️' },
  STATUS_CHANGED: { label: 'Durum Değişti', color: 'bg-purple-100 text-purple-800', icon: '🔄' },
  TASK_DELETED: { label: 'Görev Silindi', color: 'bg-red-100 text-red-800', icon: '🗑️' },
  MESSAGE_SENT: { label: 'Mesaj Gönderildi', color: 'bg-green-100 text-green-800', icon: '✉️' },
  MESSAGE_DELETED: { label: 'Mesaj Silindi', color: 'bg-red-100 text-red-800', icon: '❌' },
  COMMENT_CREATED: { label: 'Yorum Eklendi', color: 'bg-blue-100 text-blue-800', icon: '💬' },
  COMMENT_DELETED: { label: 'Yorum Silindi', color: 'bg-red-100 text-red-800', icon: '🗑️' },
  ADMIN_APPROVED: { label: 'Admin Onayladı', color: 'bg-indigo-100 text-indigo-800', icon: '✅' },
  ADMIN_REJECTED: { label: 'Admin Reddetti', color: 'bg-pink-100 text-pink-800', icon: '❌' },
}

export default function ActivityLog({ initialLogs, users, isAdmin }: ActivityLogProps) {
  const [logs, setLogs] = useState<Log[]>(initialLogs)
  const [userId, setUserId] = useState('')
  const [action, setAction] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  // Logları API'dan getirir
  const fetchLogs = async () => {
    const params = new URLSearchParams()
    if (userId) params.set('userId', userId)
    if (action) params.set('action', action)
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    const res = await fetch('/api/logs?' + params.toString())
    if (res.ok) {
      const data = await res.json()
      setLogs(data.logs)
    }
  }

  useEffect(() => {
    fetchLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, action, from, to])

  // Logları tarih bazında grupla
  const grouped: Record<string, Log[]> = {}
  logs.forEach((log) => {
    const date = new Date(log.createdAt).toLocaleDateString('tr-TR')
    grouped[date] = grouped[date] ? [...grouped[date], log] : [log]
  })

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block mb-1 text-sm">Kullanıcı</label>
              <select className="input-field" value={userId} onChange={(e) => setUserId(e.target.value)}>
                <option value="">Tümü</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm">Aksiyon</label>
              <select className="input-field" value={action} onChange={(e) => setAction(e.target.value)}>
                <option value="">Tümü</option>
                {Object.entries(actionInfo).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm">Başlangıç</label>
              <input type="date" className="input-field" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <label className="block mb-1 text-sm">Bitiş</label>
              <input type="date" className="input-field" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {Object.keys(grouped).length === 0 ? (
        <div className="card text-center">Hiç kayıt yok</div>
      ) : (
        Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="space-y-2">
            <h3 className="text-lg font-medium">{date}</h3>
            {items.map((log) => {
              const info = actionInfo[log.action] || { label: log.action, color: 'bg-gray-100 text-gray-800', icon: 'ℹ️' }
              return (
                <div key={log.id} className="card flex items-start space-x-2 text-sm">
                  <div className="mt-1">{info.icon}</div>
                  <div className="flex-1">
                    <p>
                      <span className="font-medium">{log.user?.name || 'Sistem'}</span> - {info.label}
                      {log.task && <span className="ml-1">({log.task.title})</span>}
                    </p>
                    {log.details && <p className="text-gray-500">{log.details}</p>}
                    <span className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString('tr-TR')}</span>
                  </div>
                </div>
              )
            })}
          </div>
        ))
      )}
    </div>
  )
}
