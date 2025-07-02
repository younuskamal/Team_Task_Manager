'use client'

import { useEffect, useState } from 'react'
import TaskComments from './TaskComments'
import { useNotification } from './NotificationProvider'

interface Comment {
  id: number
  content: string
  createdAt: string
  user: { id: number; name: string }
}

interface TaskDetail {
  id: number
  title: string
  description?: string
  dueDate?: string
  status: string
  user: { id: number; name: string }
  comments: Comment[]
}

export default function TaskModal({ taskId, currentUserId, onClose }: { taskId: number; currentUserId: number; onClose: () => void }) {
  const [task, setTask] = useState<TaskDetail | null>(null)
  const { notify } = useNotification()

  useEffect(() => {
    const fetchTask = async () => {
      const res = await fetch(`/api/tasks/${taskId}`)
      if (res.ok) {
        const data = await res.json()
        setTask(data)
      } else {
        notify('Görev getirilirken hata')
        onClose()
      }
    }
    fetchTask()
  }, [taskId])

  if (!task) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded w-full max-w-lg max-h-screen overflow-y-auto space-y-4">
        <button onClick={onClose} className="float-right text-red-600">✖</button>
        <h2 className="text-xl font-bold mb-2">{task.title}</h2>
        {task.description && <p>{task.description}</p>}
        <div className="text-sm text-gray-500 space-x-4">
          <span>Oluşturan: {task.user.name}</span>
          {task.dueDate && (
            <span>Bitiş: {new Date(task.dueDate).toLocaleDateString('tr-TR')}</span>
          )}
          <span>Durum: {task.status}</span>
        </div>
        <TaskComments taskId={task.id} initialComments={task.comments} currentUserId={currentUserId} />
      </div>
    </div>
  )
}
