import React, { useState, useRef } from 'react'
import { soundSystem } from '../lib/soundSystem'

type Win = {
  id: string
  title: string
  x: number
  y: number
  w: number
  h: number
  minimized?: boolean
  maximized?: boolean
  closing?: boolean
}

export default function WindowManager() {
  const [windows, setWindows] = useState<Win[]>([
    { id: 'w1', title: 'Sample App', x: 80, y: 80, w: 320, h: 220 }
  ])
  const [trails, setTrails] = useState<Array<{ x: number; y: number; age: number }>>([])
  const dragging = useRef<{ id: string | null; offsetX: number; offsetY: number }>({ id: null, offsetX: 0, offsetY: 0 })

  function bringToFront(id: string) {
    setWindows(ws => {
      const idx = ws.findIndex(w => w.id === id)
      if (idx === -1) return ws
      const w = ws[idx]
      const others = ws.filter(x => x.id !== id)
      return [...others, w]
    })
  }

  function onDragStart(e: React.PointerEvent<HTMLDivElement>, id: string) {
    const w = windows.find(x => x.id === id)!
    dragging.current = { id, offsetX: e.clientX - w.x, offsetY: e.clientY - w.y }
    e.currentTarget.setPointerCapture(e.pointerId)
    bringToFront(id)
  }

  function onDragMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current.id) return
    const { id, offsetX, offsetY } = dragging.current
    setWindows(ws => ws.map(w => w.id === id ? { ...w, x: e.clientX - offsetX, y: e.clientY - offsetY } : w))
    setTrails(t => [...t, { x: e.clientX, y: e.clientY, age: 0 }].slice(-8))
  }

  function onDragEnd(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current.id) return
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch {}
    dragging.current = { id: null, offsetX: 0, offsetY: 0 }
  }

  function toggleMinimize(id: string) {
    soundSystem.click()
    setWindows(ws => ws.map(w => w.id === id ? { ...w, minimized: !w.minimized } : w))
  }

  function toggleMaximize(id: string) {
    soundSystem.windowOpen()
    setWindows(ws => ws.map(w => w.id === id ? { ...w, maximized: !w.maximized, x: w.maximized ? 80 : 40, y: w.maximized ? 80 : 40 } : w))
  }

  function closeWindow(id: string) {
    soundSystem.windowClose()
    setWindows(ws => ws.map(w => w.id === id ? { ...w, closing: true } : w))
    setTimeout(() => {
      setWindows(ws => ws.filter(w => w.id !== id))
    }, 300)
  }

  const animatedTrails = trails.map((t, idx) => {
    const opacity = 1 - (idx / trails.length)
    return { ...t, opacity }
  })

  return (
    <div className="relative h-[60vh]">
      {animatedTrails.map((t, i) => (
        <div key={`trail-${i}`} className="absolute w-1 h-1 bg-crimson rounded-full pointer-events-none" style={{ left: t.x, top: t.y, opacity: t.opacity * 0.4 }} />
      ))}

      {windows.map((w, i) => {
        const z = i + 10
        if (w.minimized) return (
          <div key={w.id} style={{ left: w.x, top: w.y, zIndex: z }} className="absolute p-2 text-xs text-gray-400">{w.title} (minimized)</div>
        )

        const style: React.CSSProperties = w.maximized ? { left: 40, top: 40, width: 'calc(100% - 80px)', height: 'calc(100% - 160px)', zIndex: z } : { left: w.x, top: w.y, width: w.w, height: w.h, zIndex: z }

        return (
          <div key={w.id} className={`absolute bg-gradient-to-b from-black/60 to-gray-900/50 border border-crimson/30 rounded shadow-2xl transform transition-all duration-300 ${w.closing ? 'scale-75 opacity-0' : ''}`} style={style}>
            <div
              className="h-8 flex items-center px-3 cursor-move bg-black/30 border-b border-crimson/20 rounded-t select-none"
              onPointerDown={(e) => onDragStart(e, w.id)}
              onPointerMove={(e) => onDragMove(e)}
              onPointerUp={(e) => onDragEnd(e)}
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-crimson shadow-md" />
                <div className="text-sm text-gray-200">{w.title}</div>
              </div>

              <div className="ml-auto flex gap-2">
                <button onClick={() => toggleMinimize(w.id)} className="text-xs px-2 py-1 rounded hover:bg-gray-800">_</button>
                <button onClick={() => toggleMaximize(w.id)} className="text-xs px-2 py-1 rounded hover:bg-gray-800">[ ]</button>
                <button onClick={() => closeWindow(w.id)} className="text-xs px-2 py-1 rounded hover:bg-gray-800">✕</button>
              </div>
            </div>

            <div className="p-3 text-gray-300 h-full overflow-auto">App content for {w.title} — window stacking demo.</div>
          </div>
        )
      })}
    </div>
  )
}
