import React, { useState, useRef, useEffect } from 'react'

export default function MediaPlayerApp() {
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(180)
  const [volume, setVolume] = useState(70)
  const [playlist, setPlaylist] = useState([
    { id: 1, title: 'Ambient Waves', artist: 'CyberSynthWave', duration: 180 },
    { id: 2, title: 'Neon Dreams', artist: 'SynthWave Master', duration: 240 },
    { id: 3, title: 'Digital Horizons', artist: 'Future Sound', duration: 200 }
  ])
  const [current, setCurrent] = useState(0)
  const animRef = useRef<number>()

  useEffect(() => {
    if (playing) {
      animRef.current = setInterval(() => {
        setTime(t => (t >= duration ? 0 : t + 1))
      }, 1000)
    }
    return () => clearInterval(animRef.current)
  }, [playing, duration])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const handleNext = () => {
    setCurrent((current + 1) % playlist.length)
    setTime(0)
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-black/60 to-black/40 p-4">
      {/* Album Art */}
      <div className="flex-1 flex items-center justify-center mb-4 min-h-[200px]">
        <div className={`w-40 h-40 rounded-lg bg-gradient-to-br from-crimson to-purple-900 flex items-center justify-center ${playing ? 'animate-pulse-slow' : ''}`}>
          <div className="text-5xl">♫</div>
        </div>
      </div>

      {/* Track Info */}
      <div className="text-center mb-3">
        <div className="text-lg text-gray-100 font-semibold">{playlist[current].title}</div>
        <div className="text-sm text-gray-400">{playlist[current].artist}</div>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="w-full bg-gray-800 h-1 rounded overflow-hidden mb-1">
          <div className="bg-crimson h-full" style={{ width: `${(time / duration) * 100}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>{formatTime(time)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button onClick={() => setCurrent(Math.max(0, current - 1))} className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600">⏮</button>
        <button onClick={() => setPlaying(!playing)} className="px-6 py-2 rounded bg-crimson text-black font-bold hover:scale-105">{playing ? '⏸' : '▶'}</button>
        <button onClick={handleNext} className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600">⏭</button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm text-gray-400">🔊</span>
        <input type="range" min="0" max="100" value={volume} onChange={e => setVolume(Number(e.target.value))} className="flex-1 h-1 rounded" />
        <span className="text-sm text-gray-400">{volume}%</span>
      </div>

      {/* Playlist */}
      <div className="border-t border-gray-700 pt-2 max-h-32 overflow-auto">
        <div className="text-xs text-gray-400 mb-2">Playlist</div>
        {playlist.map((track, i) => (
          <div key={track.id} onClick={() => { setCurrent(i); setTime(0) }} className={`p-2 rounded text-xs cursor-pointer ${i === current ? 'bg-crimson/30' : 'hover:bg-gray-700/40'}`}>
            <div className="text-gray-300">{track.title}</div>
            <div className="text-gray-500">{track.artist}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
