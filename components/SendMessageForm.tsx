'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useNotification } from './NotificationProvider'

interface User {
  id: number
  name: string
  email: string
}

interface SendMessageFormProps {
  users: User[]
}

export default function SendMessageForm({ users }: SendMessageFormProps) {
  const [receiverId, setReceiverId] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { notify } = useNotification()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!receiverId || !content.trim()) {
      setError('Lütfen alıcı ve mesaj içeriğini doldurun')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: parseInt(receiverId),
          content: content.trim()
        }),
      })

      if (response.ok) {
        setReceiverId('')
        setContent('')
        router.refresh()
        notify('Mesaj gönderildi')
      } else {
        const data = await response.json()
        setError(data.error || 'Mesaj gönderilirken bir hata oluştu')
      }
    } catch (error) {
      setError('Bağlantı hatası')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Yeni Mesaj Gönder</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="receiver" className="block text-sm font-medium text-gray-700 mb-1">
            Alıcı
          </label>
          <select
            id="receiver"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            className="input-field"
            required
          >
            <option value="">Alıcı seçin...</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Mesaj
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Mesajınızı yazın..."
            rows={4}
            className="input-field resize-none"
            required
          />
          <div className="text-xs text-gray-500 mt-1">
            {content.length}/500 karakter
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !receiverId || !content.trim()}
          className="btn-primary w-full"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Gönderiliyor...
            </div>
          ) : (
            'Mesaj Gönder'
          )}
        </button>
      </form>
    </div>
  )
}