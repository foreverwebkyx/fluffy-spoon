import React, { useState } from 'react'

export default function CalculatorApp() {
  const [display, setDisplay] = useState('0')
  const [prev, setPrev] = useState<number | null>(null)
  const [op, setOp] = useState<string | null>(null)
  const [newNum, setNewNum] = useState(true)
  const [mode, setMode] = useState<'standard' | 'scientific'>('standard')

  const handleNum = (n: string) => {
    setDisplay(newNum ? n : display === '0' ? n : display + n)
    setNewNum(false)
  }

  const handleOp = (o: string) => {
    const num = parseFloat(display)
    if (prev !== null && op && !newNum) {
      const result = compute(prev, num, op)
      setDisplay(String(result))
      setPrev(result)
    } else {
      setPrev(num)
    }
    setOp(o)
    setNewNum(true)
  }

  const compute = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b
      case '-': return a - b
      case '*': return a * b
      case '/': return a / b
      case '%': return a % b
      case '^': return Math.pow(a, b)
      default: return b
    }
  }

  const handleEquals = () => {
    if (op && prev !== null) {
      const result = compute(prev, parseFloat(display), op)
      setDisplay(String(result))
      setPrev(null)
      setOp(null)
      setNewNum(true)
    }
  }

  const handleClear = () => {
    setDisplay('0')
    setPrev(null)
    setOp(null)
    setNewNum(true)
  }

  const handleSci = (fn: string) => {
    const n = parseFloat(display)
    let result = 0
    switch (fn) {
      case 'sin': result = Math.sin(n); break
      case 'cos': result = Math.cos(n); break
      case 'tan': result = Math.tan(n); break
      case 'sqrt': result = Math.sqrt(n); break
      case 'log': result = Math.log10(n); break
      case 'ln': result = Math.log(n); break
    }
    setDisplay(String(result.toFixed(6)))
    setNewNum(true)
  }

  const buttons = ['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+']

  return (
    <div className="w-full h-full flex flex-col bg-black/40 p-4">
      <div className="flex gap-2 mb-3">
        <button onClick={() => setMode('standard')} className={`px-3 py-1 text-xs rounded ${mode==='standard' ? 'bg-crimson text-black' : 'bg-gray-700'}`}>Standard</button>
        <button onClick={() => setMode('scientific')} className={`px-3 py-1 text-xs rounded ${mode==='scientific' ? 'bg-crimson text-black' : 'bg-gray-700'}`}>Scientific</button>
      </div>

      <div className="bg-black/60 rounded p-3 mb-3 text-right text-2xl text-gray-100 font-mono overflow-hidden">{display}</div>

      {mode === 'scientific' && (
        <div className="grid grid-cols-3 gap-1 mb-2">
          {['sin','cos','tan','sqrt','log','ln'].map(fn => (
            <button key={fn} onClick={() => handleSci(fn)} className="px-2 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600">{fn}</button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-4 gap-1 flex-1">
        {buttons.map(b => (
          <button
            key={b}
            onClick={() => b === '=' ? handleEquals() : ['+','-','*','/','^','%'].includes(b) ? handleOp(b) : handleNum(b)}
            className={`rounded font-semibold hover:scale-105 ${b==='=' ? 'bg-crimson text-black' : ['+','-','*','/','^','%'].includes(b) ? 'bg-crimson/40' : 'bg-gray-800'}`}
          >
            {b}
          </button>
        ))}
      </div>

      <button onClick={handleClear} className="w-full mt-2 px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm">Clear</button>
    </div>
  )
}
