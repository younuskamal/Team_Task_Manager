import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import UserManagement from '@/components/UserManagement'
import AdminStats from '@/components/AdminStats'

export default async function AdminPage() {
  const user = await getUser()
  
  if (!user || user.role !== 'admin') {
    redirect('/gorevler')
  }

  const [users, tasks, messages] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            tasks: true,
            sentMessages: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.task.findMany({
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.message.findMany({
      select: {
        id: true,
        createdAt: true,
      },
    }),
  ])

  const stats = {
    totalUsers: users.length,
    totalTasks: tasks.length,
    totalMessages: messages.length,
    tasksByStatus: {
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
    },
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Yönetim Paneli
        </h1>
      </div>

      <AdminStats stats={stats} />
      
      <UserManagement users={users} currentUser={user} />
    </div>
  )
}