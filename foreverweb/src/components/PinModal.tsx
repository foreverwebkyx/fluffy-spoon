import React, { useState } from 'react'
import foreverDB from '../lib/foreverDB'

export default function PinModal({ open, mode, username, onClose, onSaved }: { open: boolean, mode: 'enable'|'disable', username: string, onClose: () => void, onSaved?: () => void }) {
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (mode === 'enable') {
      if (!/^\d{4,6}$/.test(pin)) return setError('PIN must be 4-6 digits')
      if (pin !== confirm) return setError('PINs do not match')
      const res = await foreverDB.enablePin(username, pin)
      if (res.ok) { onSaved && onSaved(); onClose() }
      else setError(res.reason || 'Failed')
    } else {
      if (!/^\d{4,6}$/.test(pin)) return setError('PIN must be 4-6 digits')
      const v = await foreverDB.verifyPin(username, pin)
      if (!v.ok) return setError('Incorrect PIN')
      const d = await foreverDB.disablePin(username)
      if (d.ok) { onSaved && onSaved(); onClose() }
      else setError(d.reason || 'Failed')
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-96 p-6 rounded-lg bg-black/70 border border-crimson/20 backdrop-blur-sm z-10">
        <h4 className="text-crimson mb-3">{mode === 'enable' ? 'Enable PIN Login' : 'Disable PIN Login'}</h4>
        <div className="mb-2 text-gray-300 text-sm">Enter PIN</div>
        <input value={pin} onChange={e => setPin(e.target.value)} className="w-full mb-2 p-2 rounded bg-gray-900 text-white" inputMode="numeric" />
        {mode === 'enable' && (
          <>
            <div className="mb-2 text-gray-300 text-sm">Confirm PIN</div>
            <input value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full mb-2 p-2 rounded bg-gray-900 text-white" inputMode="numeric" />
          </>
        )}
        {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1 rounded bg-gray-800 text-gray-300">Cancel</button>
          <button type="submit" className="px-3 py-1 rounded bg-crimson text-black">{mode === 'enable' ? 'Enable' : 'Disable'}</button>
        </div>
      </form>
    </div>
  )
}
