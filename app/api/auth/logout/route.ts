import { NextResponse } from 'next/server'
import { logout, getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const user = await getUser()
    await logout()

    if (user) {
      await prisma.log.create({
        data: {
          action: 'LOGOUT',
          details: `${user.name} çıkış yaptı`,
          userId: user.id
        }
      })

      await prisma.sessionLog.updateMany({
        where: { userId: user.id, loggedOutAt: null },
        data: { loggedOutAt: new Date() }
      })
    }

    return NextResponse.json(
      { message: 'Çıkış başarılı' },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Çıkış yapılırken bir hata oluştu' },
      { status: 500 }
    )
  }
}