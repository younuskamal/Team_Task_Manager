'use client'

import { useEffect, useState } from 'react'

const colors = {
  ocean: '#3b82f6',
  calm: '#10b981',
  sunset: '#f97316',
  colorful: '#a855f7',
  forest: '#16a34a',
  royal: '#6366f1',
}

export default function ThemeSelector() {
  const [dark, setDark] = useState(false)
  const [color, setColor] = useState('ocean')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.style.setProperty(
      '--primary',
      colors[color as keyof typeof colors]
    )
    localStorage.setItem('theme-dark', dark ? '1' : '0')
    localStorage.setItem('theme-color', color)
  }, [dark, color])

  useEffect(() => {
    const storedDark = localStorage.getItem('theme-dark')
    const storedColor = localStorage.getItem('theme-color') as keyof typeof colors | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setDark(storedDark ? storedDark === '1' : prefersDark)
    if (storedColor && colors[storedColor]) setColor(storedColor)
  }, [])

  return (
    <div className="space-y-6">
      <div className="card">
        <h4 className="font-medium mb-2">Görünüm Modu</h4>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={dark}
            onChange={(e) => setDark(e.target.checked)}
          />
          <span>Karanlık Mod</span>
        </label>
      </div>
      <div className="card">
        <h4 className="font-medium mb-2">Renk Teması</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(colors).map((key) => (
            <label
              key={key}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="radio"
                name="color"
                value={key}
                checked={color === key}
                onChange={() => setColor(key)}
                className="sr-only"
              />
              <span
                className={`w-6 h-6 rounded border ${
                  color === key ? 'ring-2' : ''
                }`}
                style={{
                  background: colors[key as keyof typeof colors],
                  boxShadow: color === key ? `0 0 0 2px ${colors[key as keyof typeof colors]}` : undefined
                }}
              ></span>
              <span className="capitalize">{key}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
