import React, { useState, useEffect } from 'react'

export default function SystemTray() {
  const [time, setTime] = useState(new Date())
  const [battery, setBattery] = useState(85)
  const [network, setNetwork] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-3 bg-gray-900/80 border border-gray-700 rounded-lg px-4 py-2 backdrop-blur z-40 text-sm text-gray-300">
      {/* Network */}
      <button className="hover:text-gray-200" title="Network Status">
        {network ? '📶' : '⚠️'}
      </button>

      {/* Battery */}
      <div className="flex items-center gap-1">
        <span title="Battery Level">{battery > 50 ? '🔋' : battery > 20 ? '🪫' : '🔴'}</span>
        <span className="text-xs">{battery}%</span>
      </div>

      {/* Volume */}
      <button className="hover:text-gray-200" title="Volume">🔊</button>

      {/* Time */}
      <div className="border-l border-gray-700 pl-3 font-mono text-xs">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>

      {/* Date */}
      <button className="text-xs hover:text-gray-200" title="Calendar">
        {time.toLocaleDateString([], { month: 'short', day: 'numeric' })}
      </button>
    </div>
  )
}
