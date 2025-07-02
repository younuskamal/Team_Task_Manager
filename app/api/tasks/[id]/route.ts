import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 })
    }
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
    if (!task) {
      return NextResponse.json({ error: 'Görev bulunamadı' }, { status: 404 })
    }
    if (user.role !== 'admin' && task.userId !== user.id) {
      return NextResponse.json({ error: 'Bu görevi görme yetkiniz yok' }, { status: 403 })
    }
    return NextResponse.json(task)
  } catch (error) {
    console.error('Task fetch error:', error)
    return NextResponse.json({ error: 'Görev getirilirken hata' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 }
      )
    }

    const taskId = parseInt(params.id)
    const { status, title, description, dueDate, followUp, deleted } = await request.json()

    // Check if task exists and user has permission
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Görev bulunamadı' },
        { status: 404 }
      )
    }

    if (user.role !== 'admin' && existingTask.userId !== user.id) {
      return NextResponse.json(
        { error: 'Bu görevi güncelleme yetkiniz yok' },
        { status: 403 }
      )
    }

    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (followUp !== undefined) updateData.followUp = !!followUp
    if (deleted !== undefined) updateData.deleted = !!deleted

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Create log entry
    let logAction = 'TASK_UPDATED'
    let logDetails = 'Görev güncellendi'
    if (status && status !== existingTask.status) {
      const statusLabels = {
        pending: 'Beklemede',
        'in-progress': 'Devam Ediyor',
        completed: 'Tamamlandı',
      }
      logAction = 'STATUS_CHANGED'
      logDetails = `Görev durumu değiştirildi: ${statusLabels[status as keyof typeof statusLabels]}`
      if (status === 'completed') {
        await prisma.user.update({ where: { id: task.userId }, data: { score: { increment: 5 } } })
      }
    }

    await prisma.log.create({
      data: {
        action: logAction,
        details: logDetails,
        userId: user.id,
        taskId: task.id,
      },
    })

    return NextResponse.json(task)
  } catch (error: any) {
    console.error('Task update error:', error)
    return NextResponse.json(
      { error: 'Görev güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 }
      )
    }

    const taskId = parseInt(params.id)

    // Check if task exists and user has permission
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Görev bulunamadı' },
        { status: 404 }
      )
    }

    if (user.role !== 'admin' && existingTask.userId !== user.id) {
      return NextResponse.json(
        { error: 'Bu görevi silme yetkiniz yok' },
        { status: 403 }
      )
    }

    // Create log entry before deletion
    await prisma.log.create({
      data: {
        action: 'TASK_DELETED',
        details: `Görev silindi: ${existingTask.title}`,
        userId: user.id,
        taskId: taskId,
      },
    })

    await prisma.task.update({
      where: { id: taskId },
      data: { deleted: true },
    })

    return NextResponse.json(
      { message: 'Görev başarıyla silindi' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Task deletion error:', error)
    return NextResponse.json(
      { error: 'Görev silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}