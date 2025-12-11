import React, { useState } from 'react'

interface UserMenuProps {
  username: string
  onLogout: () => void
  onLock: () => void
  onSwitch?: () => void
}

export default function UserMenu({ username, onLogout, onLock, onSwitch }: UserMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative z-30">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-crimson/50 transition-all"
        title="User Menu"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-crimson to-crimson/60 flex items-center justify-center">
          <span className="text-xs font-bold text-black">{username.charAt(0).toUpperCase()}</span>
        </div>
        <span className="text-sm text-gray-300 hidden sm:inline">{username}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-crimson/30 bg-black/80 backdrop-blur shadow-xl shadow-crimson/20 overflow-hidden animate-slideDown">
          <div className="p-3 border-b border-gray-700">
            <p className="text-xs text-gray-400">Logged in as</p>
            <p className="text-sm font-semibold text-white">{username}</p>
          </div>

          <div className="py-2">
            <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-crimson/20 hover:text-crimson transition-colors flex items-center gap-2">
              <span>👤</span> Profile
            </button>
            <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-crimson/20 hover:text-crimson transition-colors flex items-center gap-2">
              <span>⚙️</span> Settings
            </button>
            <button
              onClick={() => { onSwitch && onSwitch(); setOpen(false) }}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-crimson/20 hover:text-crimson transition-colors flex items-center gap-2"
            >
              <span>🔁</span> Switch Account
            </button>
            <button
              onClick={() => { onLock(); setOpen(false) }}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-crimson/20 hover:text-crimson transition-colors flex items-center gap-2"
            >
              <span>🔒</span> Lock Screen
            </button>
          </div>

          <div className="border-t border-gray-700 p-2">
            <button
              onClick={() => { onLogout(); setOpen(false) }}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/20 transition-colors rounded font-semibold flex items-center gap-2"
            >
              <span>🚪</span> Logout
            </button>
          </div>
        </div>
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
