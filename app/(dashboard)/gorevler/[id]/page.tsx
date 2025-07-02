import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import TaskComments from '@/components/TaskComments'

export default async function TaskDetailPage({ params }: { params: { id: string } }) {
  const user = await getUser()
  if (!user) redirect('/giris')

  const taskId = parseInt(params.id)
  const task = await prisma.task.findFirst({
    where: { id: taskId, deleted: false },
    include: {
      user: { select: { id: true, name: true } },
      comments: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  if (!task || (user.role !== 'admin' && task.userId !== user.id)) {
    redirect('/gorevler')
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-4">
        <h1 className="text-2xl font-bold">{task.title}</h1>
        {task.description && <p>{task.description}</p>}
        <div className="text-sm text-gray-500 space-x-4">
          <span>Oluşturan: {task.user.name}</span>
          {task.dueDate && (
            <span>Bitiş: {new Date(task.dueDate).toLocaleDateString('tr-TR')}</span>
          )}
          <span>Durum: {task.status}</span>
        </div>
      </div>
      <div className="card">
        <TaskComments taskId={task.id} initialComments={task.comments} currentUserId={user.id} />
      </div>
    </div>
  )
}
