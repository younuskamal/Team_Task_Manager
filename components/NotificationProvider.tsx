'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

interface NotificationContextType {
  notify: (message: string) => void
}

const NotificationContext = createContext<NotificationContextType>({
  notify: () => {}
})

export function useNotification() {
  return useContext(NotificationContext)
}

export default function NotificationProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)

  const notify = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {message && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white dark:bg-gray-700 px-4 py-2 rounded shadow-md animate-fade">
          {message}
        </div>
      )}
    </NotificationContext.Provider>
  )
}
