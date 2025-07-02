import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Yeni yorum oluşturur veya getirir
export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 })
    }

    const { taskId, content } = await request.json()
    if (!taskId || !content) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 })
    }

    const comment = await prisma.comment.create({
      data: { content, taskId, userId: user.id },
      include: { user: { select: { id: true, name: true } } }
    })

    await prisma.log.create({
      data: {
        action: 'COMMENT_CREATED',
        details: `Yorum eklendi: ${content.slice(0, 20)}`,
        userId: user.id,
        taskId
      }
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (err) {
    console.error('Create comment error:', err)
    return NextResponse.json({ error: 'Yorum eklenirken hata' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const taskId = parseInt(searchParams.get('taskId') || '')
    if (!taskId) {
      return NextResponse.json({ error: 'taskId gerekli' }, { status: 400 })
    }
    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' }
    })
    return NextResponse.json({ comments })
  } catch (err) {
    console.error('Get comments error:', err)
    return NextResponse.json({ error: 'Yorumlar getirilirken hata' }, { status: 500 })
  }
}
