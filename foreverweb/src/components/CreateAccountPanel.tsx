import React, { useState, useEffect, useRef } from 'react'
import { soundSystem } from '../lib/soundSystem'
import { authAPI } from '../lib/authAPI'

export default function CreateAccountPanel({
  onClose,
  onComplete
}: {
  onClose: () => void
  onComplete: (username: string) => void
}) {
  const [step, setStep] = useState(1) // 1: username, 2: password, 3: email, 4: OTP, 5: PIN
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [otpTimer, setOtpTimer] = useState(0)
  const checkTimeoutRef = useRef<number | undefined>(undefined)
  const lastQueryRef = useRef('')

  // OTP timer countdown
  useEffect(() => {
    let interval: number | undefined
    if (otpTimer > 0) {
      interval = window.setInterval(() => setOtpTimer(t => t - 1), 1000)
    }
    return () => {
      if (interval !== undefined) window.clearInterval(interval)
    }
  }, [otpTimer])

  // Debounced username availability check with race protection and network handling
  useEffect(() => {
    if (!username) {
      setUsernameAvailable(null)
      return
    }
    if (username.length < 3) {
      setUsernameAvailable(null)
      return
    }

    setError('')
    if (checkTimeoutRef.current) window.clearTimeout(checkTimeoutRef.current)
    lastQueryRef.current = username
    checkTimeoutRef.current = window.setTimeout(async () => {
      try {
        const q = lastQueryRef.current
        const res = await authAPI.checkUsername(q)
        // ignore stale responses
        if (q !== username) return
        if (res && res.ok === true) setUsernameAvailable(true)
        else if (res && res.reason === 'network') {
          setUsernameAvailable(null)
          setError('Cannot reach auth server')
        } else setUsernameAvailable(false)
      } catch (err) {
        setUsernameAvailable(null)
        setError('Cannot reach auth server')
      }
    }, 400)

    return () => {
      if (checkTimeoutRef.current) window.clearTimeout(checkTimeoutRef.current)
    }
  }, [username])

  const getPasswordStrength = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 6) strength++
    if (pwd.length >= 10) strength++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
    if (/\d/.test(pwd)) strength++
    if (/[^a-zA-Z\d]/.test(pwd)) strength++
    return Math.min(strength, 4)
  }

  const strength = getPasswordStrength(password)
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500']

  const handleNextStep = async () => {
    setError('')
    soundSystem.click()

    if (step === 1) {
      if (!username || username.length < 3) {
        setError('Username at least 3 chars')
        return
      }
      if (!usernameAvailable) {
        setError('Username taken')
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (password.length < 6) {
        setError('Password at least 6 chars')
        return
      }
      setStep(3)
    } else if (step === 3) {
      if (!email || !email.includes('@')) {
        setError('Valid email required')
        return
      }
      setLoading(true)
      const res = await authAPI.register(username, email, password)
      setLoading(false)
      if (!res.ok) {
        setError(res.reason || 'Registration failed')
        return
      }
      setOtpTimer(600) // 10 minutes
      setStep(4)
    } else if (step === 4) {
      if (otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
        setError('6-digit OTP required')
        return
      }
      setLoading(true)
      const res = await authAPI.verifyOTP(username, otpCode)
      setLoading(false)
      if (!res.ok) {
        setError(res.reason || 'Invalid OTP')
        return
      }
      setStep(5)
    } else if (step === 5) {
      // Optional PIN
      if (pin) {
        if (pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
          setError('PIN: 4-6 digits')
          return
        }
        if (pin !== pinConfirm) {
          setError('PINs do not match')
          return
        }
        setLoading(true)
        const res = await authAPI.verifyOTP(username, otpCode, pin)
        setLoading(false)
        if (!res.ok) {
          setError(res.reason || 'PIN setup failed')
          return
        }
      }
      // Account created
      soundSystem.bootBeep?.()
      onComplete(username)
    }
  }

  const handleResendOTP = async () => {
    setError('')
    setLoading(true)
    const res = await authAPI.register(username, email, password)
    setLoading(false)
    if (res.ok) {
      setOtpTimer(600)
      setError('')
    } else {
      setError('Resend failed')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-96 p-6 rounded-lg bg-black/70 border border-crimson/30 backdrop-blur-sm shadow-lg shadow-crimson/20">
        <h3 className="text-crimson text-lg mb-4">Create Account</h3>

        {step === 1 && (
          <div className="space-y-3">
            <div>
              <label className="text-gray-300 text-sm">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full mt-1 p-2 rounded bg-gray-900/50 text-white border border-gray-700 focus:border-crimson focus:outline-none"
                placeholder="Choose a username"
              />
              {username && username.length < 3 && (
                <p className="text-yellow-400 text-xs mt-1">Minimum 3 characters</p>
              )}
              {usernameAvailable === true && (
                <p className="text-green-400 text-xs mt-1">✓ Available</p>
              )}
              {usernameAvailable === false && (
                <p className="text-red-400 text-xs mt-1">✗ Taken</p>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div>
              <label className="text-gray-300 text-sm">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 p-2 rounded bg-gray-900/50 text-white border border-gray-700 focus:border-crimson focus:outline-none"
                placeholder="Enter password"
              />
              <div className="mt-2 flex gap-1 h-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded ${i < strength ? strengthColors[strength] : 'bg-gray-700'}`}
                  />
                ))}
              </div>
              <p className="text-gray-400 text-xs mt-1">{strengthLabels[strength]}</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <div>
              <label className="text-gray-300 text-sm">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 p-2 rounded bg-gray-900/50 text-white border border-gray-700 focus:border-crimson focus:outline-none"
                placeholder="your@email.com"
              />
              <p className="text-gray-400 text-xs mt-1">OTP will be sent here</p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <div>
              <label className="text-gray-300 text-sm">Enter OTP Code</label>
              <input
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.slice(0, 6))}
                className="w-full mt-1 p-2 rounded bg-gray-900/50 text-white border border-gray-700 focus:border-crimson focus:outline-none text-center text-2xl tracking-widest"
                placeholder="000000"
                inputMode="numeric"
              />
              <p className="text-gray-400 text-xs mt-2">Sent to {email}</p>
              {otpTimer > 0 ? (
                <p className="text-crimson text-xs mt-1">Expires in {Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, '0')}</p>
              ) : (
                <button
                  onClick={handleResendOTP}
                  className="text-crimson text-xs mt-1 hover:underline"
                  disabled={loading}
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3">
            <p className="text-gray-300 text-sm">Optional: Set a PIN for quick login</p>
            <div>
              <label className="text-gray-300 text-sm">PIN (4-6 digits)</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.slice(0, 6))}
                className="w-full mt-1 p-2 rounded bg-gray-900/50 text-white border border-gray-700 focus:border-crimson focus:outline-none"
                placeholder="Leave blank to skip"
                inputMode="numeric"
              />
            </div>
            {pin && (
              <div>
                <label className="text-gray-300 text-sm">Confirm PIN</label>
                <input
                  type="password"
                  value={pinConfirm}
                  onChange={(e) => setPinConfirm(e.target.value.slice(0, 6))}
                  className="w-full mt-1 p-2 rounded bg-gray-900/50 text-white border border-gray-700 focus:border-crimson focus:outline-none"
                  placeholder="Confirm PIN"
                  inputMode="numeric"
                />
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-3 p-2 rounded bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-800 text-gray-300 hover:bg-gray-700"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleNextStep}
            className="px-4 py-2 rounded bg-crimson text-black hover:bg-red-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Loading...' : step === 5 ? 'Complete' : 'Next'}
          </button>
        </div>

        <div className="mt-4 flex gap-1 justify-center">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded ${s <= step ? 'bg-crimson' : 'bg-gray-700'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
