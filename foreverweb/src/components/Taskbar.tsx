import React from 'react'
import { soundSystem } from '../lib/soundSystem'

export default function Taskbar({ onOpenDashboard }: { onOpenDashboard: () => void }) {
  const apps = [
    { id: 'editor', name: 'Editor', icon: '📝' },
    { id: 'browser', name: 'Browser', icon: '🌐' },
    { id: 'files', name: 'Files', icon: '📁' }
  ]

  function handleLauncherClick() {
    soundSystem.click()
    onOpenDashboard()
  }

  return (
    <div className="fixed left-0 right-0 bottom-0 z-50 flex items-center justify-center py-3 pointer-events-auto">
      <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-crimson/15 shadow-lg">
        <button onClick={handleLauncherClick} className="px-3 py-2 rounded-md bg-gradient-to-r from-crimson/80 to-crimson/60 text-black font-semibold hover:scale-105 transform transition ripple-btn">Launcher</button>

        <div className="flex items-center gap-3">
          {apps.map(a => (
            <div key={a.id} className="flex flex-col items-center gap-1 px-2 py-1 group">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-black/50 border border-crimson/10 group-hover:scale-110 transition-transform shadow-md reflective-icon">{a.icon}</div>
              <div className="text-xs text-gray-400">{a.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
