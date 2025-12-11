import React, { useState } from 'react'

type FileItem = { name: string; type: 'file' | 'folder'; size?: number; modified?: string }

export default function FileExplorerApp() {
  const [path, setPath] = useState('/home/user')
  const [view, setView] = useState<'list' | 'grid'>('grid')
  const [items, setItems] = useState<FileItem[]>([
    { name: 'Documents', type: 'folder' },
    { name: 'Downloads', type: 'folder' },
    { name: 'Desktop', type: 'folder' },
    { name: 'Pictures', type: 'folder' },
    { name: 'note.txt', type: 'file', size: 2048, modified: 'Dec 11' },
    { name: 'project.zip', type: 'file', size: 1024000, modified: 'Dec 10' }
  ])
  const [selected, setSelected] = useState<string | null>(null)

  const handleNavigate = (folder: string) => {
    setPath(path === '/' ? `/${folder}` : `${path}/${folder}`)
    setItems([{ name: '..', type: 'folder' }, ...items.filter(i => i.type === 'folder').slice(0, 2)])
  }

  return (
    <div className="w-full h-full flex flex-col bg-black/40">
      <div className="border-b border-gray-700 p-3 flex gap-2 items-center">
        <button className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-xs">←</button>
        <button className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-xs">→</button>
        <div className="flex-1 px-3 py-1 bg-black/60 rounded text-sm text-gray-300 overflow-hidden">{path}</div>
        <button onClick={() => setView(view === 'list' ? 'grid' : 'list')} className="px-2 py-1 rounded bg-crimson/40 text-xs">{view === 'list' ? '⊞' : '☰'}</button>
      </div>

      <div className={`flex-1 overflow-auto p-3 ${view === 'grid' ? 'grid grid-cols-4 gap-3' : ''}`}>
        {items.map((item, i) => (
          <div
            key={i}
            onClick={() => setSelected(item.name)}
            className={`p-2 rounded cursor-pointer transition ${selected === item.name ? 'bg-crimson/30 border border-crimson' : 'bg-gray-800/40 hover:bg-gray-700/40'}`}
          >
            <div className={`text-3xl mb-1 ${view === 'grid' ? 'text-center' : ''}`}>
              {item.type === 'folder' ? '📁' : item.name.endsWith('.zip') ? '📦' : '📄'}
            </div>
            <div className={`text-xs text-gray-300 ${view === 'grid' ? 'text-center' : 'truncate'}`}>{item.name}</div>
            {view === 'list' && item.size && <div className="text-xs text-gray-500">{(item.size / 1024).toFixed(0)} KB • {item.modified}</div>}
          </div>
        ))}
      </div>

      {selected && <div className="border-t border-gray-700 p-2 text-xs text-gray-400">Selected: {selected}</div>}
    </div>
  )
}
