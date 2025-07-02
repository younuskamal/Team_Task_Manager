import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Belirli bir mesajı siler
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 })
    }

    const messageId = parseInt(params.id)
    const message = await prisma.message.findUnique({ where: { id: messageId }, include: { sender: true, receiver: true } })
    if (!message) {
      return NextResponse.json({ error: 'Mesaj bulunamadı' }, { status: 404 })
    }

    // Admin değilse sadece ilgili mesajları silebilir
    if (user.role !== 'admin' && message.senderId !== user.id && message.receiverId !== user.id) {
      return NextResponse.json({ error: 'Bu mesajı silme yetkiniz yok' }, { status: 403 })
    }

    await prisma.message.update({ where: { id: messageId }, data: { deleted: true } })

    // Log kaydı oluştur
    await prisma.log.create({
      data: {
        action: 'MESSAGE_DELETED',
        details: `${user.name} bir mesajı sildi`,
        userId: user.id
      }
    })

    return NextResponse.json({ message: 'Mesaj silindi' })
  } catch (error) {
    console.error('Delete message error:', error)
    return NextResponse.json({ error: 'Mesaj silinirken bir hata oluştu' }, { status: 500 })
  }
}
