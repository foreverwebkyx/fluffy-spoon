import React, { useState, useEffect } from 'react'
import { soundSystem } from '../lib/soundSystem'
import { authAPI } from '../lib/authAPI'

export default function ForgotPasswordPanel({
  onClose,
  onSuccess
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [step, setStep] = useState(1) // 1: email, 2: OTP, 3: new password
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)

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

  const getPasswordStrength = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 6) strength++
    if (pwd.length >= 10) strength++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
    if (/\d/.test(pwd)) strength++
    if (/[^a-zA-Z\d]/.test(pwd)) strength++
    return Math.min(strength, 4)
  }

  const strength = getPasswordStrength(newPassword)
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500']

  const handleNextStep = async () => {
    setError('')
    soundSystem.click?.()

    if (step === 1) {
      if (!email || !email.includes('@')) {
        setError('Valid email required')
        return
      }
      setLoading(true)
      const res = await authAPI.forgotPassword(email)
      setLoading(false)
      if (!res.ok) {
        setError(res.reason || 'Failed to send OTP')
        return
      }
      setOtpTimer(600) // 10 minutes
      setStep(2)
    } else if (step === 2) {
      if (otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
        setError('6-digit OTP required')
        return
      }
      setStep(3)
    } else if (step === 3) {
      if (newPassword.length < 6) {
        setError('Password at least 6 chars')
        return
      }
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
      setLoading(true)
      const res = await authAPI.resetPassword(email, otpCode, newPassword)
      setLoading(false)
      if (!res.ok) {
        setError(res.reason || 'Reset failed')
        return
      }
      soundSystem.bootBeep?.()
      onSuccess()
    }
  }

  const handleResendOTP = async () => {
    setError('')
    setLoading(true)
    const res = await authAPI.forgotPassword(email)
    setLoading(false)
    if (res.ok) {
      setOtpTimer(600)
    } else {
      setError('Resend failed')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-96 p-6 rounded-lg bg-black/70 border border-crimson/30 backdrop-blur-sm shadow-lg shadow-crimson/20">
        <h3 className="text-crimson text-lg mb-4">Reset Password</h3>

        {step === 1 && (
          <div className="space-y-3">
            <div>
              <label className="text-gray-300 text-sm">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 p-2 rounded bg-gray-900/50 text-white border border-gray-700 focus:border-crimson focus:outline-none"
                placeholder="your@email.com"
              />
              <p className="text-gray-400 text-xs mt-1">We'll send an OTP to verify your identity</p>
            </div>
          </div>
        )}

        {step === 2 && (
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

        {step === 3 && (
          <div className="space-y-3">
            <div>
              <label className="text-gray-300 text-sm">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full mt-1 p-2 rounded bg-gray-900/50 text-white border border-gray-700 focus:border-crimson focus:outline-none"
                placeholder="Enter new password"
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
            <div>
              <label className="text-gray-300 text-sm">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mt-1 p-2 rounded bg-gray-900/50 text-white border border-gray-700 focus:border-crimson focus:outline-none"
                placeholder="Confirm new password"
              />
            </div>
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
            {loading ? 'Loading...' : step === 3 ? 'Reset Password' : 'Next'}
          </button>
        </div>

        <div className="mt-4 flex gap-1 justify-center">
          {[1, 2, 3].map((s) => (
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
