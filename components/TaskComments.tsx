'use client'

import { useState } from 'react'
import { useNotification } from './NotificationProvider'

interface Comment {
  id: number
  content: string
  createdAt: string
  user: { id: number; name: string }
}

interface Props {
  taskId: number
  initialComments: Comment[]
  currentUserId: number
}

export default function TaskComments({ taskId, initialComments, currentUserId }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [text, setText] = useState('')
  const { notify } = useNotification()

  const handleAdd = async () => {
    if (!text.trim()) return
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, content: text.trim() })
    })
    if (res.ok) {
      const comment = await res.json()
      setComments([...comments, comment])
      setText('')
      notify('Yorum eklendi')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Yorum silinsin mi?')) return
    const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setComments(comments.filter(c => c.id !== id))
      notify('Yorum silindi')
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Yorumlar</h3>
      {comments.length === 0 ? (
        <p className="text-gray-500">Henüz yorum yok</p>
      ) : (
        <ul className="space-y-2">
          {comments.map(c => (
            <li key={c.id} className="border-b pb-2">
              <div className="flex justify-between text-sm">
                <span>
                  <strong>{c.user.name}</strong> -{' '}
                  {new Date(c.createdAt).toLocaleString('tr-TR')}
                </span>
                {(c.user.id === currentUserId) && (
                  <button onClick={() => handleDelete(c.id)} className="text-red-600">🗑️</button>
                )}
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">{c.content}</p>
            </li>
          ))}
        </ul>
      )}
      <div className="flex space-x-2">
        <input
          type="text"
          className="flex-1 input-field"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Yorum yaz..."
        />
        <button onClick={handleAdd} className="btn-primary">Gönder</button>
      </div>
    </div>
  )
}
