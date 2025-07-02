import { NextRequest, NextResponse } from 'next/server'
import { login } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-posta ve şifre gereklidir' },
        { status: 400 }
      )
    }

    const result = await login(email, password)

    await prisma.sessionLog.create({
      data: {
        userId: result.user.id,
        ip: request.headers.get('x-forwarded-for') || request.ip || null,
        userAgent: request.headers.get('user-agent') || null
      }
    })

    await prisma.log.create({
      data: {
        action: 'LOGIN',
        details: `${result.user.name} giriş yaptı`,
        userId: result.user.id
      }
    })

    return NextResponse.json(
      { message: 'Giriş başarılı', user: result.user },
      { status: 200 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Giriş yapılırken bir hata oluştu' },
      { status: 401 }
    )
  }
}