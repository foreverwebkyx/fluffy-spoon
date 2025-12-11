import React, { useEffect, useState, useRef } from 'react'

export default function CursorGlow() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const screenRef = useRef({ w: typeof window !== 'undefined' ? window.innerWidth : 1024, h: typeof window !== 'undefined' ? window.innerHeight : 768 })

  useEffect(() => {
    screenRef.current = { w: window.innerWidth, h: window.innerHeight }
  }, [])

  useEffect(() => {
    function onMove(e: MouseEvent) {
      setPos({ x: e.clientX, y: e.clientY })
      // Parallax: subtle offset based on cursor position
      const pct = { x: e.clientX / screenRef.current.w, y: e.clientY / screenRef.current.h }
      setOffset({
        x: (pct.x - 0.5) * 20,
        y: (pct.y - 0.5) * 20
      })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      aria-hidden
      style={{ left: pos.x - 80 + offset.x, top: pos.y - 80 + offset.y, transition: 'all 0.6s ease-out' }}
      className="pointer-events-none fixed w-[160px] h-[160px] rounded-full -z-10 mix-blend-screen opacity-40"
    >
      <div className="w-full h-full rounded-full bg-gradient-to-r from-transparent to-crimson/60 blur-2xl animate-pulse-slow" />
    </div>
  )
}
