import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import MessageList from '@/components/MessageList'
import SendMessageForm from '@/components/SendMessageForm'

export default async function MessagesPage() {
  const user = await getUser()
  if (!user) {
    redirect('/giris')
  }

  // Get all users for the send message form
  const users = await prisma.user.findMany({
    where: {
      id: { not: user.id }
    },
    select: {
      id: true,
      name: true,
      email: true
    },
    orderBy: {
      name: 'asc'
    }
  })

  // Get messages where user is sender or receiver
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mesajlar</h1>
        <span className="text-sm text-gray-500">{messages.length} mesaj</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Message Form */}
        <div className="lg:col-span-1">
          <SendMessageForm users={users} />
        </div>

        {/* Messages List */}
        <div className="lg:col-span-2">
          <MessageList messages={messages} currentUserId={user.id} />
        </div>
      </div>
    </div>
  )
}