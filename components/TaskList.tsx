'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TaskModal from './TaskModal'
import { useNotification } from './NotificationProvider'

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface TaskUser {
  name: string
  email: string
}

interface Task {
  id: number
  title: string
  description?: string
  dueDate?: string
  status: string
  followUp: boolean
  userId: number
  user: TaskUser
  _count: {
    comments: number
  }
  createdAt: string
}

interface TaskListProps {
  tasks: Task[]
  currentUser: User
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
}

const statusLabels = {
  pending: 'Beklemede',
  'in-progress': 'Devam Ediyor',
  completed: 'Tamamlandı',
}

export default function TaskList({ tasks, currentUser }: TaskListProps) {
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<number | null>(null)
  const router = useRouter()
  const { notify } = useNotification()

  useEffect(() => {
    const now = Date.now()
    tasks.forEach((t) => {
      if (t.dueDate && t.status !== 'completed') {
        const diff = new Date(t.dueDate).getTime() - now
        if (diff > 0 && diff <= 21600000) {
          notify(`"${t.title}" görevinin bitişi yaklaşıyor`)
        }
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    return task.status === filter
  })

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        router.refresh()
        notify('Görev güncellendi')
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
        notify('Görev silindi')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            filter === 'all'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tümü ({tasks.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            filter === 'pending'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Beklemede ({tasks.filter(t => t.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('in-progress')}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            filter === 'in-progress'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Devam Ediyor ({tasks.filter(t => t.status === 'in-progress').length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            filter === 'completed'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tamamlandı ({tasks.filter(t => t.status === 'completed').length})
        </button>
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {filter === 'all' ? 'Henüz görev yok' : `${statusLabels[filter as keyof typeof statusLabels]} durumunda görev yok`}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelected(task.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <a
                      href={`/gorevler/${task.id}`}
                      onClick={(e) => { e.preventDefault(); setSelected(task.id) }}
                      className="text-lg font-medium text-primary-600 hover:underline"
                    >
                      {task.title}
                    </a>
                    {task.followUp && <span title="Takip" className="text-yellow-500">⭐</span>}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status as keyof typeof statusColors]}`}>
                      {statusLabels[task.status as keyof typeof statusLabels]}
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className="text-gray-600 mb-2">{task.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {currentUser.role === 'admin' && (
                      <span>👤 {task.user.name}</span>
                    )}
                    {task.dueDate && (
                      <span>📅 {new Date(task.dueDate).toLocaleDateString('tr-TR')}</span>
                    )}
                    <span>💬 {task._count.comments} yorum</span>
                    <span>📅 {new Date(task.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {(currentUser.id === task.userId || currentUser.role === 'admin') && (
                    <>
                      <select
                        value={task.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="pending">Beklemede</option>
                        <option value="in-progress">Devam Ediyor</option>
                        <option value="completed">Tamamlandı</option>
                      </select>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id) }}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Görevi Sil"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {selected && (
        <TaskModal
          taskId={selected}
          currentUserId={currentUser.id}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}