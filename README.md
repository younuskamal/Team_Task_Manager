# Görev Yönetim Sistemi (Team Task Manager)

Modern ve kullanıcı dostu bir görev yönetim sistemi. Next.js 14 App Router, Prisma ORM, SQLite ve TailwindCSS kullanılarak geliştirilmiştir.

## 🚀 Özellikler

### 👥 Kullanıcı Yönetimi
- E-posta/şifre ile kimlik doğrulama
- İki kullanıcı rolü: **Admin** ve **Kullanıcı**
- Profil yönetimi ve şifre değiştirme
- Kullanıcı istatistikleri

### 📋 Görev Yönetimi
- Görev oluşturma, düzenleme ve silme
- Görev durumu takibi (Beklemede, Devam Ediyor, Tamamlandı)
- Son teslim tarihi takibi
- Görev yorumlama sistemi

### 💬 Mesajlaşma Sistemi
- Kullanıcılar arası düz metin mesajlaşma
- Mesaj geçmişi görüntüleme
- Gönderilen/alınan mesaj istatistikleri

### 🛠️ Admin Paneli
- Kullanıcı yönetimi (rol değiştirme, kullanıcı silme)
- Sistem istatistikleri
- Tüm görevleri görüntüleme ve yönetme
- Aktivite logları

## 🛠️ Teknolojiler

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS
- **Backend**: Next.js API Routes
- **Veritabanı**: SQLite + Prisma ORM
- **Kimlik Doğrulama**: JWT (Jose)
- **Şifreleme**: bcryptjs
- **Doğrulama**: Zod
- **Dil**: TypeScript

## 📦 Kurulum

### Gereksinimler
- Node.js 18+ 
- npm veya yarn

### Adımlar

1. **Bağımlılıkları yükleyin:**
```bash
npm install
```
2. **Ortam dosyasını oluşturun:**
```bash
cp .env.example .env
```
`ADMIN_CODE` değerini istediğiniz gibi ayarlayabilirsiniz (varsayılan `omu`).

3. **Veritabanını oluşturun:**
```bash
npx prisma db push
```

4. **Örnek verileri yükleyin:**
```bash
npm run seed
```

5. **Geliştirme sunucusunu başlatın:**
```bash
npm run dev
```

6. **Tarayıcınızda açın:**
```
http://localhost:3000
```

## 👤 Varsayılan Kullanıcılar

Seed işlemi sonrasında aşağıdaki kullanıcılar oluşturulur:

### Admin Kullanıcısı
- **E-posta**: admin@example.com
- **Şifre**: admin123
- **Rol**: Admin

### Normal Kullanıcı
- **E-posta**: user@example.com
- **Şifre**: user123
- **Rol**: Kullanıcı

## 📁 Proje Yapısı

```
Team Task Manager/
├── app/                          # Next.js App Router
│   ├── (dashboard)/             # Korumalı sayfalar
│   │   ├── admin/               # Admin paneli
│   │   ├── gorevler/            # Görevler sayfası
│   │   ├── mesajlar/            # Mesajlar sayfası
│   │   ├── profil/              # Profil sayfası
│   │   └── layout.tsx           # Dashboard layout
│   ├── api/                     # API rotaları
│   │   ├── admin/               # Admin API'leri
│   │   ├── auth/                # Kimlik doğrulama API'leri
│   │   ├── messages/            # Mesaj API'leri
│   │   ├── profile/             # Profil API'leri
│   │   └── tasks/               # Görev API'leri
│   ├── giris/                   # Giriş sayfası
│   ├── kayit/                   # Kayıt sayfası
│   ├── globals.css              # Global stiller
│   ├── layout.tsx               # Ana layout
│   └── page.tsx                 # Ana sayfa
├── components/                   # React bileşenleri
│   ├── AdminStats.tsx           # Admin istatistikleri
│   ├── CreateTaskForm.tsx       # Görev oluşturma formu
│   ├── MessageList.tsx          # Mesaj listesi
│   ├── Navigation.tsx           # Navigasyon menüsü
│   ├── ProfileForm.tsx          # Profil düzenleme formu
│   ├── SendMessageForm.tsx      # Mesaj gönderme formu
│   ├── TaskList.tsx             # Görev listesi
│   ├── UserManagement.tsx       # Kullanıcı yönetimi
│   └── UserStats.tsx            # Kullanıcı istatistikleri
├── lib/                         # Yardımcı kütüphaneler
│   ├── auth.ts                  # Kimlik doğrulama fonksiyonları
│   └── prisma.ts                # Prisma client
├── prisma/                      # Veritabanı
│   ├── schema.prisma            # Veritabanı şeması
│   └── seed.ts                  # Örnek veri
├── middleware.ts                # Next.js middleware
└── ...
```

## 🗄️ Veritabanı Şeması

### Tablolar
- **User**: Kullanıcı bilgileri ve rolleri
- **Task**: Görev bilgileri ve durumları
- **Message**: Kullanıcılar arası mesajlar
- **Comment**: Görev yorumları
- **Log**: Sistem aktivite logları

### İlişkiler
- Kullanıcılar birden fazla göreve sahip olabilir
- Görevler birden fazla yoruma sahip olabilir
- Kullanıcılar birbirleriyle mesajlaşabilir
- Tüm aktiviteler log tablosunda kaydedilir

## 🔧 Geliştirme Komutları

```bash
# Geliştirme sunucusu
npm run dev

# Üretim build
npm run build

# Üretim sunucusu
npm start

# Veritabanı push
npm run db:push

# Prisma Studio
npm run db:studio

# Prisma generate
npm run db:generate

# Veritabanı migration
npm run db:migrate

# Seed verilerini yükle
npm run seed

# Linting
npm run lint
```

## 🎨 UI/UX Özellikleri

- **Responsive tasarım**: Mobil ve masaüstü uyumlu
- **Modern arayüz**: TailwindCSS ile şık tasarım
- **Türkçe dil desteği**: Tüm arayüz Türkçe
- **Kullanıcı dostu**: Sezgisel navigasyon
- **Hızlı yükleme**: Optimized performans

## 🔒 Güvenlik

- JWT tabanlı kimlik doğrulama
- Şifre hashleme (bcrypt)
- Route koruması (middleware)
- Rol tabanlı erişim kontrolü
- Input doğrulama (Zod)

## 📝 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 İletişim

Proje hakkında sorularınız için issue açabilirsiniz.

---

**Görev Yönetim Sistemi** - Modern, güvenli ve kullanıcı dostu görev yönetimi çözümü.