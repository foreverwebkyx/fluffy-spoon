import React, { useState, useRef, useEffect } from 'react'

export default function GameArcadeApp() {
  const [game, setGame] = useState<'menu' | 'snake' | 'breakout' | 'flappy'>('menu')
  const [score, setScore] = useState(0)

  const SnakeGame = () => {
    const [snake, setSnake] = useState([{ x: 10, y: 10 }])
    const [food, setFood] = useState({ x: 15, y: 15 })
    const [dir, setDir] = useState({ x: 1, y: 0 })
    const gameRef = useRef<number>()

    useEffect(() => {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'ArrowUp' && dir.y === 0) setDir({ x: 0, y: -1 })
        if (e.key === 'ArrowDown' && dir.y === 0) setDir({ x: 0, y: 1 })
        if (e.key === 'ArrowLeft' && dir.x === 0) setDir({ x: -1, y: 0 })
        if (e.key === 'ArrowRight' && dir.x === 0) setDir({ x: 1, y: 0 })
      }
      window.addEventListener('keydown', handleKeyPress)
      return () => window.removeEventListener('keydown', handleKeyPress)
    }, [dir])

    useEffect(() => {
      gameRef.current = setInterval(() => {
        setSnake(s => {
          const head = { x: s[0].x + dir.x, y: s[0].y + dir.y }
          if (head.x === food.x && head.y === food.y) {
            setScore(sc => sc + 10)
            setFood({ x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) })
            return [head, ...s]
          }
          return [head, ...s.slice(0, -1)]
        })
      }, 100)
      return () => clearInterval(gameRef.current)
    }, [dir, food])

    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 grid gap-px p-2 bg-black" style={{ gridTemplateColumns: 'repeat(20, 1fr)' }}>
          {Array.from({ length: 400 }).map((_, i) => {
            const x = i % 20
            const y = Math.floor(i / 20)
            const isSnake = snake.some(s => s.x === x && s.y === y)
            const isFood = food.x === x && food.y === y
            return <div key={i} className={`w-full aspect-square ${isSnake ? 'bg-crimson' : isFood ? 'bg-yellow-500' : 'bg-gray-900'}`} />
          })}
        </div>
        <div className="text-center py-2 text-gray-300">Score: {score}</div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-black/40">
      {game === 'menu' ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <h2 className="text-2xl text-crimson font-bold">Game Arcade</h2>
          <button onClick={() => { setGame('snake'); setScore(0) }} className="px-6 py-3 rounded bg-crimson text-black font-bold hover:scale-105">🐍 Snake</button>
          <button onClick={() => { setGame('breakout'); setScore(0) }} className="px-6 py-3 rounded bg-crimson text-black font-bold hover:scale-105">🧱 Breakout</button>
          <button onClick={() => { setGame('flappy'); setScore(0) }} className="px-6 py-3 rounded bg-crimson text-black font-bold hover:scale-105">🐦 Flappy</button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-gray-700">
            <button onClick={() => setGame('menu')} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm">← Back</button>
            <div className="text-gray-300">Score: {score}</div>
          </div>
          <div className="flex-1">
            {game === 'snake' && <SnakeGame />}
            {game === 'breakout' && <div className="flex items-center justify-center text-gray-400">Breakout Game Coming Soon</div>}
            {game === 'flappy' && <div className="flex items-center justify-center text-gray-400">Flappy Game Coming Soon</div>}
          </div>
        </div>
      )}
    </div>
  )
}
