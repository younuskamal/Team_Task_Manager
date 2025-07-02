import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/ProfileForm'
import UserStats from '@/components/UserStats'
import ThemeSelector from '@/components/ThemeSelector'

export default async function ProfilePage() {
  const user = await getUser()
  if (!user) {
    redirect('/giris')
  }

  // Get user statistics
  const stats = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      createdAt: true,
      score: true,
      _count: {
        select: {
          tasks: true,
          sentMessages: true,
          receivedMessages: true,
          comments: true
        }
      },
      tasks: {
        select: {
          status: true
        }
      }
    }
  })

  if (!stats) {
    redirect('/giris')
  }

  // Calculate task statistics
  const taskStats = {
    total: stats._count.tasks,
    pending: stats.tasks.filter(task => task.status === 'pending').length,
    inProgress: stats.tasks.filter(task => task.status === 'in-progress').length,
    completed: stats.tasks.filter(task => task.status === 'completed').length
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
        <span className="text-sm text-gray-500">
          Üye olma tarihi: {new Date(stats.createdAt).toLocaleDateString('tr-TR')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <ProfileForm user={user} />
        </div>

        {/* Kullanıcı istatistikleri */}
        <div className="lg:col-span-1 space-y-6">
          <UserStats
            taskStats={taskStats}
          messageStats={{
            sent: stats._count.sentMessages,
            received: stats._count.receivedMessages
          }}
          commentCount={stats._count.comments}
          score={stats.score}
          />
          <div className="card">
            <h3 className="text-lg font-medium mb-4">Tema Ayarları</h3>
            <ThemeSelector />
          </div>
        </div>
      </div>
    </div>
  )
}