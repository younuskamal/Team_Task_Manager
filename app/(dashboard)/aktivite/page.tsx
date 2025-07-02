// Kullanıcı aktivitelerini listeleyen sayfa
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ActivityLog from '@/components/ActivityLog'

export default async function ActivityPage() {
  const user = await getUser()
  if (!user) redirect('/giris')

  // Log kayıtlarını getir
  const logs = await prisma.log.findMany({
    where: user.role === 'admin' ? {} : { userId: user.id },
    include: {
      user: { select: { name: true } },
      task: { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Admin ise filtreler için kullanıcı listesini al
  const users = user.role === 'admin'
    ? await prisma.user.findMany({ select: { id: true, name: true } })
    : []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Aktivite Kaydı</h1>
      <ActivityLog initialLogs={logs} users={users} isAdmin={user.role === 'admin'} />
    </div>
  )
}
