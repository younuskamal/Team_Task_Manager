'use client'

import { useRef, useEffect } from 'react'
import { useNotification } from './NotificationProvider'

interface User {
  id: number
  name: string
  email: string
}

interface Message {
  id: number
  content: string
  createdAt: string
  senderId: number
  receiverId: number
  sender: User
  receiver: User
  seen: boolean
}

interface MessageListProps {
  messages: Message[]
  currentUserId: number
}

export default function MessageList({ messages, currentUserId }: MessageListProps) {
  const { notify } = useNotification()
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const div = listRef.current
    if (div) div.scrollTop = div.scrollHeight
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz mesaj yok</h3>
          <p className="text-gray-500">İlk mesajınızı gönderin!</p>
        </div>
      </div>
    )
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Mesaj silinsin mi?')) return
    await fetch(`/api/messages/${id}`, { method: 'DELETE' })
    notify('Mesaj silindi')
    window.location.reload()
  }

  const handleClear = async () => {
    if (!confirm('Tüm mesajlar silinsin mi?')) return
    await fetch('/api/messages/clear', { method: 'POST' })
    notify('Tüm mesajlar silindi')
    window.location.reload()
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Mesaj Geçmişi</h2>
        <button onClick={handleClear} className="text-sm text-red-600">Tümünü Sil</button>
      </div>
      <div ref={listRef} className="space-y-4 max-h-96 overflow-y-auto">
        {messages.map((message) => {
          const isFromCurrentUser = message.senderId === currentUserId
          const otherUser = isFromCurrentUser ? message.receiver : message.sender

          return (
            <div
              key={message.id}
              className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isFromCurrentUser
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">
                    {isFromCurrentUser ? 'Siz' : otherUser.name}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs ${
                        isFromCurrentUser
                          ? 'text-primary-100 dark:text-primary-200'
                          : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleString('tr-TR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {isFromCurrentUser && message.seen && (
                      <span className="text-xs">✔️</span>
                    )}
                    <button onClick={() => handleDelete(message.id)} className="text-red-600 text-xs">🗑️</button>
                  </div>
                </div>
                <p className="text-sm">{message.content}</p>
                {!isFromCurrentUser && (
                  <p className="text-xs mt-1 opacity-75">
                    Kime: {message.receiver.name}
                  </p>
                )}
                {isFromCurrentUser && (
                  <p className="text-xs mt-1 opacity-75">
                    Kime: {message.receiver.name}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}