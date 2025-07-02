import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Veritabanı seed işlemi başlatılıyor...')

  try {

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12)
    console.log('👤 Admin kullanıcısı oluşturuluyor...')
    
    await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        name: 'Sistem Yöneticisi',
        email: 'admin@example.com',
        password: adminPassword,
        role: 'admin'
      }
    })

    // Create sample user
    const userPassword = await bcrypt.hash('user123', 12)
    console.log('👤 Örnek kullanıcı oluşturuluyor...')
    
    await prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: {
        name: 'Örnek Kullanıcı',
        email: 'user@example.com',
        password: userPassword,
        role: 'kullanıcı'
      }
    })

    console.log('✅ Seed işlemi tamamlandı!')
    console.log('📧 Admin: admin@example.com (şifre: admin123)')
    console.log('📧 Kullanıcı: user@example.com (şifre: user123)')
  } catch (error) {
    console.error('❌ Seed işlemi sırasında hata:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed işlemi başarısız:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })