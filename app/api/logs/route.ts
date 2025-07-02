import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Kullanıcının görebileceği log kayıtlarını getirir
export async function GET(request: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)

  const where: any = user.role === 'admin' ? {} : { userId: user.id }

  // Filtreleme parametreleri
  const userId = searchParams.get('userId')
  const action = searchParams.get('action')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  if (userId) where.userId = parseInt(userId)
  if (action) where.action = action
  if (from || to) {
    where.createdAt = {}
    if (from) where.createdAt.gte = new Date(from)
    if (to) where.createdAt.lte = new Date(to)
  }

  // Log kayıtlarını getir
  const logs = await prisma.log.findMany({
    where,
    include: {
      user: { select: { name: true } },
      task: { select: { title: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json({ logs })
}
