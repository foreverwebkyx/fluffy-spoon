import React, { useEffect, useState } from 'react'

export default function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [bootText, setBootText] = useState('')
  const [username, setUsername] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('forever:user')
    if (stored) setUsername(stored)

    const bootMessages = [
      'Initializing Crimson Core...',
      'Loading particle field...',
      'Activating cursor glow...',
      'Mounting window manager...',
      'Initializing Forever API...',
      'Starting audio system...',
      'Loading applications...',
      'Booting desktop environment...'
    ]

    let currentMsg = 0
    let currentProgress = 0

    const msgInterval = setInterval(() => {
      if (currentMsg < bootMessages.length) {
        setBootText(bootMessages[currentMsg])
        currentMsg++
      }
    }, 400)

    const progressInterval = setInterval(() => {
      currentProgress += Math.random() * 25
      if (currentProgress > 100) {
        currentProgress = 100
        clearInterval(progressInterval)
      }
      setProgress(currentProgress)
    }, 200)

    const completeTimeout = setTimeout(() => {
      setProgress(100)
      setBootText('Ready!')
      clearInterval(msgInterval)
      setTimeout(onComplete, 800)
    }, 3500)

    return () => {
      clearInterval(msgInterval)
      clearInterval(progressInterval)
      clearTimeout(completeTimeout)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black text-white z-50">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5">
        <div style={{
          backgroundImage: 'linear-gradient(90deg, #ff1a2a 1px, transparent 1px), linear-gradient(0deg, #ff1a2a 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Animated shapes */}
      <div className="absolute top-1/4 left-1/4 w-48 h-48 border-2 border-crimson/20 rounded-full animate-spin-slow" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-32 h-32 border-2 border-crimson/10 rounded-lg animate-pulse-slow" style={{ animationDuration: '4s' }} />

      {/* Content */}
      <div className="relative z-10 text-center max-w-md">
        {/* Logo */}
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-wider mb-2">
            <span className="text-white">FOREVER</span>
            <span className="text-crimson">WEB</span>
          </h1>
          <p className="text-crimson text-xs tracking-widest">BOOTING CRIMSON CORE...</p>
        </div>

        {/* Welcome message */}
        {username && (
          <p className="text-gray-400 mb-8 text-sm">Welcome back, <span className="text-crimson font-semibold">{username}</span></p>
        )}

        {/* Progress bar */}
        <div className="mb-6">
          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-crimson to-crimson/50 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-gray-500 text-xs">{Math.floor(progress)}%</p>
        </div>

        {/* Boot messages */}
        <div className="mb-4 min-h-6">
          <p className="text-gray-400 text-xs font-mono transition-all duration-300 animate-pulse-slow">
            {bootText}
            <span className="animate-blink">▌</span>
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse-slow" />
          <span>System active</span>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
