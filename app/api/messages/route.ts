import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Send a new message
export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 })
    }

    const { receiverId, content } = await request.json()

    if (!receiverId || !content?.trim()) {
      return NextResponse.json({ error: 'Alıcı ve mesaj içeriği gereklidir' }, { status: 400 })
    }

    if (content.length > 500) {
      return NextResponse.json({ error: 'Mesaj 500 karakterden uzun olamaz' }, { status: 400 })
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    })

    if (!receiver) {
      return NextResponse.json({ error: 'Alıcı bulunamadı' }, { status: 404 })
    }

    // Prevent sending message to self
    if (receiverId === user.id) {
      return NextResponse.json({ error: 'Kendinize mesaj gönderemezsiniz' }, { status: 400 })
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: user.id,
        receiverId,
        seen: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    await prisma.user.update({
      where: { id: user.id },
      data: { score: { increment: 1 } }
    })

    // Log the action
    await prisma.log.create({
      data: {
        action: 'MESSAGE_SENT',
        details: `${user.name} kullanıcısı ${receiver.name} kullanıcısına mesaj gönderdi`,
        userId: user.id
      }
    })

    return NextResponse.json({ 
      message: 'Mesaj başarıyla gönderildi',
      data: message
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// Get messages for current user
export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 })
    }

    const messages = await prisma.message.findMany({
      where: {
        deleted: false,
        OR: [
          { senderId: user.id },
          { receiverId: user.id }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    await prisma.message.updateMany({
      where: { receiverId: user.id, seen: false },
      data: { seen: true }
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}