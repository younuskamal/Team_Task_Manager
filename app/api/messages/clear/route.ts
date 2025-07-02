import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Kullanıcının tüm mesajlarını siler
export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 })
    }

    await prisma.message.updateMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }]
      },
      data: { deleted: true }
    })

    // Log kaydı oluştur
    await prisma.log.create({
      data: {
        action: 'MESSAGE_DELETED',
        details: `${user.name} tüm mesajlarını sildi`,
        userId: user.id
      }
    })

    return NextResponse.json({ message: 'Tüm mesajlar silindi' })
  } catch (error) {
    console.error('Clear messages error:', error)
    return NextResponse.json({ error: 'Mesajlar silinirken bir hata oluştu' }, { status: 500 })
  }
}
