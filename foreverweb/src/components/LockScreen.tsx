import React, { useState } from 'react'

interface LockScreenProps {
  username: string
  onUnlock: () => void
}

export default function LockScreen({ username, onUnlock }: LockScreenProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [time, setTime] = useState(new Date())

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handlePinInput = (value: string) => {
    const num = value.replace(/\D/g, '')
    if (num.length <= 6) setPin(num)
    setError('')
  }

  const handleUnlock = () => {
    // Any 4-6 digit PIN works in demo
    if (pin.length >= 4 && pin.length <= 6) {
      onUnlock()
    } else {
      setError('Invalid PIN')
      setPin('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleUnlock()
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black text-white z-50">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="absolute inset-0 opacity-5">
          <div style={{
            backgroundImage: 'linear-gradient(90deg, #ff1a2a 1px, transparent 1px), linear-gradient(0deg, #ff1a2a 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>
      </div>

      {/* Lock icon */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-8 text-6xl animate-bounce" style={{ animationDuration: '2s' }}>
          🔒
        </div>

        {/* Time Display */}
        <div className="text-center mb-8">
          <p className="text-5xl font-bold mb-2">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-gray-400 text-sm">
            {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* User info */}
        <div className="text-center mb-8 max-w-xs">
          <p className="text-gray-400 text-sm mb-1">Screen locked by</p>
          <p className="text-xl font-semibold text-crimson">{username}</p>
          <p className="text-xs text-gray-500 mt-2">Enter PIN to unlock</p>
        </div>

        {/* PIN Input */}
        <div className="w-64 mb-4">
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={e => handlePinInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="••••"
            maxLength={6}
            autoFocus
            className="w-full px-4 py-4 rounded-lg bg-gray-900/50 border border-gray-700 focus:border-crimson focus:outline-none focus:shadow-lg focus:shadow-crimson/30 text-white placeholder-gray-600 transition-all text-center text-3xl tracking-widest"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}

        {/* Unlock Button */}
        <button
          onClick={handleUnlock}
          className="px-6 py-2 rounded-lg font-semibold text-black bg-crimson hover:shadow-2xl hover:shadow-crimson/50 transition-all hover:scale-105"
        >
          Unlock
        </button>

        {/* Hint */}
        <p className="text-gray-500 text-xs mt-6 max-w-xs text-center">
          Tip: Any 4-6 digit PIN unlocks this demo
        </p>
      </div>
    </div>
  )
}
