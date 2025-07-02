import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Update user password
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Mevcut şifre ve yeni şifre gereklidir' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Yeni şifre en az 6 karakter olmalıdır' }, { status: 400 })
    }

    // Get user with password from database
    const userWithPassword = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!userWithPassword) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userWithPassword.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Mevcut şifre yanlış' }, { status: 400 })
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword
      }
    })

    // Log the action
    await prisma.log.create({
      data: {
        action: 'PASSWORD_UPDATED',
        details: `${user.name} kullanıcısı şifresini güncelledi`,
        userId: user.id
      }
    })

    return NextResponse.json({ message: 'Şifre başarıyla güncellendi' })
  } catch (error) {
    console.error('Error updating password:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}