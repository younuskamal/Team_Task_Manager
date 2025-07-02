import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Yorum silme
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 })
    }
    const commentId = parseInt(params.id)
    const comment = await prisma.comment.findUnique({ where: { id: commentId }, include: { user: true } })
    if (!comment) {
      return NextResponse.json({ error: 'Yorum bulunamadı' }, { status: 404 })
    }
    if (user.role !== 'admin' && comment.userId !== user.id) {
      return NextResponse.json({ error: 'Bu yorumu silme yetkiniz yok' }, { status: 403 })
    }
    await prisma.comment.delete({ where: { id: commentId } })
    await prisma.log.create({
      data: {
        action: 'COMMENT_DELETED',
        details: `${user.name} yorum sildi`,
        userId: user.id,
        taskId: comment.taskId
      }
    })
    return NextResponse.json({ message: 'Yorum silindi' })
  } catch (err) {
    console.error('Delete comment error:', err)
    return NextResponse.json({ error: 'Yorum silinirken hata' }, { status: 500 })
  }
}
