import React, { useEffect, useState } from 'react'
import { soundSystem } from '../lib/soundSystem'

export default function LoginPanel({ onLogin }: { onLogin: (user: string) => void }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [typing, setTyping] = useState('')
  const [fail, setFail] = useState(false)

  useEffect(() => {
    const text = 'ForeverWeb System — Crimson Core Loaded'
    let i = 0
    const t = setInterval(() => {
      setTyping(text.slice(0, i++))
      if (i > text.length) clearInterval(t)
    }, 25)
    return () => clearInterval(t)
  }, [])

  function attempt() {
    if (!user) {
      soundSystem.click()
      setFail(true)
      setTimeout(() => setFail(false), 600)
      return
    }
    soundSystem.bootBeep()
    localStorage.setItem('forever:user', user)
    onLogin(user)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className={`relative w-96 p-6 rounded-xl border ${fail ? 'animate-shake border-red-500' : 'border-gray-800'} bg-black/70`}>
        <div className="text-sm text-crimson mb-2">{typing}</div>
        <div className="mb-4 text-gray-300">Identify Yourself</div>

        <label className="block text-xs text-gray-400 mb-1">Username</label>
        <input value={user} onChange={e => setUser(e.target.value)} className="w-full mb-3 p-2 bg-gray-900/60 border border-gray-800 rounded focus:outline-none focus:border-crimson" />

        <label className="block text-xs text-gray-400 mb-1">Password</label>
        <input type="password" value={pass} onChange={e => setPass(e.target.value)} className="w-full mb-4 p-2 bg-gray-900/60 border border-gray-800 rounded focus:outline-none focus:border-crimson" />

        <div className="flex justify-end">
          <button onClick={attempt} className="px-4 py-2 rounded bg-gradient-to-r from-crimson/80 to-crimson hover:from-crimson/100 text-black font-semibold ripple-btn">Sign In</button>
        </div>
      </div>
    </div>
  )
}
