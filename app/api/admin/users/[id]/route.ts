import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Update user role
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const userId = parseInt(params.id)
    const { role } = await request.json()

    if (!role || !['admin', 'kullanıcı'].includes(role)) {
      return NextResponse.json({ error: 'Geçersiz rol' }, { status: 400 })
    }

    // Prevent admin from changing their own role
    if (userId === user.id) {
      return NextResponse.json({ error: 'Kendi rolünüzü değiştiremezsiniz' }, { status: 400 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role }
    })

    // Log the action
    await prisma.log.create({
      data: {
        action: 'USER_ROLE_UPDATED',
        details: `${user.name} kullanıcısının rolü ${targetUser.role}'den ${role}'e değiştirildi`,
        userId: user.id
      }
    })

    return NextResponse.json({ 
      message: 'Kullanıcı rolü başarıyla güncellendi',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// Delete user
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const userId = parseInt(params.id)

    // Prevent admin from deleting themselves
    if (userId === user.id) {
      return NextResponse.json({ error: 'Kendi hesabınızı silemezsiniz' }, { status: 400 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    // Delete user and related data (cascade delete)
    await prisma.user.delete({
      where: { id: userId }
    })

    // Log the action
    await prisma.log.create({
      data: {
        action: 'USER_DELETED',
        details: `${targetUser.name} (${targetUser.email}) kullanıcısı silindi`,
        userId: user.id
      }
    })

    return NextResponse.json({ message: 'Kullanıcı başarıyla silindi' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}