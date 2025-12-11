import React, { useEffect, useState } from 'react'
import { soundSystem } from '../lib/soundSystem'
import foreverDB from '../lib/foreverDB'
import PinModal from './PinModal'

export default function SettingsPanel({ open, onClose, currentUser }: { open: boolean, onClose: () => void, currentUser?: string }) {
  const [speed, setSpeed] = useState<'slow'|'normal'|'fast'>('normal')
  const [sound, setSound] = useState(soundSystem.enabled)
  const [pinModalOpen, setPinModalOpen] = useState(false)
  const [pinMode, setPinMode] = useState<'enable'|'disable'>('enable')

  useEffect(() => {
    const s = (localStorage.getItem('forever:animSpeed') as 'slow'|'normal'|'fast') || 'normal'
    setSpeed(s)
    setSound(soundSystem.enabled)
  }, [])

  function apply(s: 'slow'|'normal'|'fast') {
    setSpeed(s)
    localStorage.setItem('forever:animSpeed', s)
    const root = document.documentElement
    if (s === 'slow') root.style.setProperty('--anim-mult', '1.6')
    if (s === 'normal') root.style.setProperty('--anim-mult', '1')
    if (s === 'fast') root.style.setProperty('--anim-mult', '0.6')
  }

  function toggleSound() {
    soundSystem.toggle()
    setSound(!sound)
  }

  function togglePinForUser() {
    if (!currentUser) return alert('No user signed in')
    const user = foreverDB.getUser(currentUser)
    if (!user) return alert('User not found')
    if (user.pinEnabled) setPinMode('disable')
    else setPinMode('enable')
    setPinModalOpen(true)
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-80 p-4 m-4 rounded-lg bg-black/60 border border-crimson/12 backdrop-blur-sm">
        <h3 className="text-crimson mb-4">Crimson Core Settings</h3>

        <div className="mb-4">
          <div className="mb-2 text-gray-300 text-sm">Animation Speed</div>
          <div className="flex gap-2">
            <button onClick={() => apply('slow')} className={`px-3 py-1 rounded ripple-btn text-xs ${speed==='slow' ? 'bg-crimson text-black' : 'bg-gray-800 text-gray-300'}`}>Slow</button>
            <button onClick={() => apply('normal')} className={`px-3 py-1 rounded ripple-btn text-xs ${speed==='normal' ? 'bg-crimson text-black' : 'bg-gray-800 text-gray-300'}`}>Normal</button>
            <button onClick={() => apply('fast')} className={`px-3 py-1 rounded ripple-btn text-xs ${speed==='fast' ? 'bg-crimson text-black' : 'bg-gray-800 text-gray-300'}`}>Fast</button>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="text-gray-300 text-sm">Sound Effects</div>
            <button onClick={toggleSound} className={`px-3 py-1 rounded ripple-btn text-xs ${sound ? 'bg-crimson text-black' : 'bg-gray-800 text-gray-300'}`}>{sound ? 'On' : 'Off'}</button>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="text-gray-300 text-sm">PIN Login</div>
            <button onClick={togglePinForUser} className={`px-3 py-1 rounded ripple-btn text-xs bg-gray-800 text-gray-300`}>{'Manage PIN'}</button>
          </div>
        </div>
        <PinModal open={pinModalOpen} mode={pinMode} username={currentUser ?? ''} onClose={() => setPinModalOpen(false)} onSaved={() => { setPinModalOpen(false); }} />
      </div>
    </div>
  )
}
