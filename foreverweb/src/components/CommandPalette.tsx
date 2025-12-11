import React, { useState, useEffect, useRef } from 'react'

interface Command {
  id: string
  label: string
  category: 'app' | 'action' | 'ai'
  icon?: string
  action: () => void
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  commands: Command[]
}

export default function CommandPalette({ isOpen, onClose, commands }: CommandPaletteProps) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  const filtered = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(Math.min(selected + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(Math.max(selected - 1, 0)) }
    if (e.key === 'Enter') { filtered[selected]?.action(); onClose() }
    if (e.key === 'Escape') { onClose() }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-start justify-center pt-12 z-[9999]" onClick={onClose}>
      <div className="w-full max-w-2xl bg-gray-900 rounded-lg shadow-2xl border border-crimson/30 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="border-b border-gray-700 p-3">
          <input
            ref={inputRef}
            value={search}
            onChange={e => { setSearch(e.target.value); setSelected(0) }}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, apps, and files..."
            className="w-full bg-black/40 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-crimson text-gray-100"
          />
        </div>

        <div className="max-h-96 overflow-auto">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No commands found</div>
          ) : (
            filtered.map((cmd, i) => (
              <div
                key={cmd.id}
                onClick={() => { cmd.action(); onClose() }}
                className={`px-4 py-3 border-b border-gray-800/50 cursor-pointer transition ${
                  i === selected ? 'bg-crimson/30' : 'hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cmd.icon || '⚙️'}</span>
                  <div className="flex-1">
                    <div className="text-gray-200 font-medium">{cmd.label}</div>
                    <div className="text-xs text-gray-500">{cmd.category}</div>
                  </div>
                  {cmd.category === 'ai' && <span className="text-xs bg-crimson/20 px-2 py-1 rounded text-crimson">AI</span>}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-black/40 border-t border-gray-700 p-2 text-xs text-gray-500 flex gap-4 justify-end">
          <span>↑↓ Navigate • ↵ Select • Esc Close</span>
        </div>
      </div>
    </div>
  )
}
