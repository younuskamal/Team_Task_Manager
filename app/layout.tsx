import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NotificationProvider from '@/components/NotificationProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Görev Yönetim Sistemi',
  description: 'Takım görev yönetim sistemi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <head>
        {/** Sayfa yüklenmeden tema ayarlarını uygula */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {try {
                let dark = localStorage.getItem('theme-dark');
                const c = localStorage.getItem('theme-color') || 'ocean';
                const colors = {ocean:'#3b82f6',calm:'#10b981',sunset:'#f97316',colorful:'#a855f7',forest:'#16a34a',royal:'#6366f1'};
                if (dark === null) {
                  const h = new Date().getHours();
                  dark = (h >= 18 || h < 6) ? '1' : '0';
                }
                if (dark === '1') document.documentElement.classList.add('dark');
                document.documentElement.style.setProperty('--primary', colors[c] || colors.ocean);
              } catch(e) {}})();`,
          }}
        />
      </head>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900`}>
        <NotificationProvider>
          <div className="min-h-screen">
            {children}
          </div>
        </NotificationProvider>
      </body>
    </html>
  )
}