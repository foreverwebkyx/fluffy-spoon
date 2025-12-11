import React, { useState } from 'react'

export default function FilesApp() {
  const [path, setPath] = useState('/home/user')
  const items = ['Documents', 'Downloads', 'Desktop', 'Pictures']

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-2 border-b border-gray-800">
        <div className="text-xs text-gray-400">{path}</div>
      </div>
      <div className="flex-1 p-4 overflow-auto">
        <div className="grid grid-cols-2 gap-2">
          {items.map(item => (
            <div key={item} className="p-2 rounded border border-gray-800 hover:bg-gray-800/40 cursor-pointer">
              <div className="text-lg mb-1">📁</div>
              <div className="text-xs text-gray-400">{item}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
