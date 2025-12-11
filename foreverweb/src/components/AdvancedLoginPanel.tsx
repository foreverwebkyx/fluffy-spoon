import React, { useState, useRef, useEffect } from 'react'
import { soundSystem } from '../lib/soundSystem'
import { authAPI } from '../lib/authAPI'
import CreateAccountPanel from './CreateAccountPanel'
import ForgotPasswordPanel from './ForgotPasswordPanel'

interface AdvancedLoginProps {
  onLogin: (user: string) => void
}

export default function AdvancedLoginPanel({ onLogin }: AdvancedLoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [pinMode, setPinMode] = useState(false)
  const [pin, setPin] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [pinMode])

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0
    let strength = 0
    if (pwd.length >= 6) strength++
    if (pwd.length >= 10) strength++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
    if (/\d/.test(pwd)) strength++
    if (/[^a-zA-Z\d]/.test(pwd)) strength++
    return Math.min(strength, 4)
  }

  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500']
  const strength = getPasswordStrength(password)

  const handleAttemptLogin = async () => {
    if (!username) {
      setError('Username required')
      soundSystem.click()
      triggerShake()
      return
    }

    if (!pinMode) {
      if (!password) { setError('Password required'); triggerShake(); return }
      soundSystem.click()
      const res = await authAPI.login(username, password)
      if (res.ok) {
        soundSystem.bootBeep?.()
        if (rememberMe) localStorage.setItem('forever:remember', username)
        localStorage.setItem('forever:user', username)
        onLogin(username)
      } else {
        setError(res.reason || 'Invalid password')
        triggerShake()
      }
      return
    }

    // PIN mode
    if (pinMode) {
      if (pin.length < 4) { setError('PIN must be 4-6 digits'); triggerShake(); return }
      const res = await authAPI.login(username, '', pin)
      if (res.ok) {
        soundSystem.bootBeep?.()
        if (rememberMe) localStorage.setItem('forever:remember', username)
        localStorage.setItem('forever:user', username)
        onLogin(username)
      } else {
        setError(res.reason || 'Invalid PIN')
        triggerShake()
      }
      return
    }
  }

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 600)
  }

  const handlePinInput = (value: string) => {
    const num = value.replace(/\D/g, '')
    if (num.length <= 6) setPin(num)
    setError('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAttemptLogin()
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Background with parallax grid */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div className="absolute inset-0 opacity-5">
        <div style={{
          backgroundImage: 'linear-gradient(90deg, #ff1a2a 1px, transparent 1px), linear-gradient(0deg, #ff1a2a 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Floating holographic blur orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-crimson rounded-full blur-3xl opacity-5" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-900 rounded-full blur-3xl opacity-5" />

      {/* Login Panel */}
      <div
        className={`relative w-full max-w-md p-8 rounded-2xl border-2 border-crimson/50 bg-black/60 backdrop-blur-xl shadow-2xl shadow-crimson/20 transition-all duration-300 ${
          shake ? 'animate-shake' : ''
        }`}
      >
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-crimson/20 to-blue-900/20 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity -z-10" />

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">
            IDENTIFY YOURSELF
          </h2>
          <p className="text-crimson text-xs tracking-widest">SECURE AUTHENTICATION</p>
        </div>

        {/* Username */}
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Username</label>
          <input
            ref={inputRef}
            type="text"
            value={username}
            onChange={e => { setUsername(e.target.value); setError('') }}
            onKeyPress={handleKeyPress}
            placeholder="Enter username"
            className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 focus:border-crimson focus:outline-none focus:shadow-lg focus:shadow-crimson/30 text-white placeholder-gray-600 transition-all"
          />
        </div>

        {/* Mode Toggle */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => { setPinMode(false); setError(''); setPin('') }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              !pinMode
                ? 'bg-crimson text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            PASSWORD
          </button>
          <button
            onClick={() => { setPinMode(true); setError(''); setPassword('') }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              pinMode
                ? 'bg-crimson text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            PIN LOGIN
          </button>
        </div>

        {/* Password or PIN Input */}
        {!pinMode ? (
          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              onKeyPress={handleKeyPress}
              placeholder="Enter password"
              className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 focus:border-crimson focus:outline-none focus:shadow-lg focus:shadow-crimson/30 text-white placeholder-gray-600 transition-all"
            />
            {password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Strength:</span>
                  <span className="text-xs text-crimson">{strengthLabels[strength]}</span>
                </div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strengthColors[strength]}`}
                    style={{ width: `${((strength + 1) / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">PIN (4-6 Digits)</label>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={e => handlePinInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="0000"
              maxLength={6}
              className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 focus:border-crimson focus:outline-none focus:shadow-lg focus:shadow-crimson/30 text-white placeholder-gray-600 transition-all text-center text-2xl tracking-widest"
            />
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 animate-slideDown">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Remember Me */}
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={() => setRememberMe(!rememberMe)}
            className={`relative w-6 h-6 rounded-md border-2 transition-all ${
              rememberMe
                ? 'bg-crimson border-crimson'
                : 'border-gray-600 bg-gray-900/50'
            }`}
          >
            {rememberMe && <span className="text-sm text-black font-bold absolute inset-0 flex items-center justify-center">✓</span>}
          </button>
          <label className="text-sm text-gray-400 cursor-pointer">Remember username for next login</label>
        </div>

        {/* Login Button */}
        <button
          onClick={handleAttemptLogin}
          className="w-full py-3 rounded-lg font-bold text-black bg-gradient-to-r from-crimson to-crimson/80 hover:shadow-2xl hover:shadow-crimson/50 transition-all duration-300 hover:scale-105 ripple-btn uppercase text-sm tracking-wider"
        >
          Sign In
        </button>

        {/* Info text */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Demo: Use any username, password optional</p>
          <div className="mt-2 flex gap-2 justify-center">
            <button onClick={() => setCreateOpen(true)} className="text-xs text-crimson underline hover:text-red-400">Create Account</button>
            <span className="text-gray-700">•</span>
            <button onClick={() => setForgotOpen(true)} className="text-xs text-crimson underline hover:text-red-400">Forgot Password?</button>
          </div>
        </div>
      </div>

      {createOpen && (
        <CreateAccountPanel
          onClose={() => setCreateOpen(false)}
          onComplete={u => {
            setCreateOpen(false)
            setUsername(u)
            setPinMode(false)
            setPassword('')
            setError('')
          }}
        />
      )}

      {forgotOpen && (
        <ForgotPasswordPanel
          onClose={() => setForgotOpen(false)}
          onSuccess={() => {
            setForgotOpen(false)
            setError('Password reset successful! Please log in.')
            setPassword('')
            setPinMode(false)
          }}
        />
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
