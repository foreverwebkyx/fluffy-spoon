import React, { useEffect, useState } from 'react'

export default function WelcomePage({ onEnter }: { onEnter: () => void }) {
  const [particles, setParticles] = useState<Array<{ x: number; y: number; id: number }>>([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [logoGlow, setLogoGlow] = useState(false)

  useEffect(() => {
    setLogoGlow(true)
    // Generate particles
    const newParticles = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100
    }))
    setParticles(newParticles)
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  const features = [
    { icon: '🪟', title: 'Multi-Window OS', desc: 'Run multiple apps simultaneously' },
    { icon: '🎮', title: 'Games & Apps', desc: 'Calculator, Browser, Chat, and more' },
    { icon: '🤖', title: 'ChatGPT AI', desc: 'AI assistant integrated system-wide' }
  ]

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-black text-white overflow-hidden relative"
    >
      {/* Animated background layers */}
      <div className="fixed inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />

        {/* Holographic grid background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(90deg, #ff1a2a 1px, transparent 1px), linear-gradient(0deg, #ff1a2a 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Parallax effect background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            transform: `translate(${(mousePos.x - window.innerWidth / 2) * 0.02}px, ${(mousePos.y - window.innerHeight / 2) * 0.02}px)`
          }}
        >
          <div className="absolute top-0 left-0 w-96 h-96 bg-crimson rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-900 rounded-full blur-3xl opacity-20" />
        </div>

        {/* Animated particles */}
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute w-1 h-1 bg-crimson rounded-full animate-pulse-slow"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              opacity: Math.random() * 0.5 + 0.3,
              animationDelay: `${p.id * 0.05}s`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        {/* Logo with glow */}
        <div className="mb-12 text-center">
          <div
            className={`inline-block px-8 py-6 rounded-2xl border-2 border-crimson/50 backdrop-blur-md bg-black/50 transition-all duration-1000 ${
              logoGlow ? 'shadow-2xl shadow-crimson/50 scale-100' : 'scale-95'
            }`}
          >
            <h1 className="text-5xl font-black tracking-wider">
              <span className="text-white">FOREVER</span>
              <span className="text-crimson">WEB</span>
            </h1>
            <p className="text-crimson text-sm tracking-widest mt-2">CRIMSON CORE OS</p>
          </div>
          <div className="mt-4 text-gray-400 text-sm">v1.0 — Advanced Web Operating System</div>
        </div>

        {/* Feature cards - animated intro */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl">
          {features.map((feature, i) => (
            <div
              key={i}
              className="p-4 rounded-lg border border-crimson/30 bg-black/40 backdrop-blur hover:border-crimson/80 hover:shadow-lg hover:shadow-crimson/30 transition-all duration-300"
              style={{
                animation: `slideIn 0.6s ease-out ${i * 0.2}s both`
              }}
            >
              <div className="text-3xl mb-2">{feature.icon}</div>
              <h3 className="font-semibold text-gray-100">{feature.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={onEnter}
          className="relative px-8 py-3 rounded-lg font-semibold text-black bg-crimson hover:shadow-2xl hover:shadow-crimson/50 transition-all duration-300 hover:scale-105 ripple-btn overflow-hidden group"
        >
          <span className="relative z-10">ENTER OS</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity" />
        </button>

        {/* Footer info */}
        <div className="absolute bottom-6 text-center text-gray-500 text-xs">
          <p>© 2025 ForeverWeb Technologies</p>
          <p className="mt-1">Experience the future of web operating systems</p>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
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
