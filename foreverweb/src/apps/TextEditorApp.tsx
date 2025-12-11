import React, { useState } from 'react'

export default function TextEditorApp() {
  const [content, setContent] = useState('// Welcome to the Text Editor\n\nconsole.log("Forever apps can access forever.ipc and forever.fs!")')

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 p-4 overflow-auto">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          className="w-full h-full bg-black/40 text-gray-300 text-sm font-mono rounded p-2 resize-none focus:outline-none focus:border-crimson border border-gray-800"
          style={{ fontFamily: 'monospace' }}
        />
      </div>
      <div className="p-2 border-t border-gray-800 flex gap-2">
        <button className="px-2 py-1 text-xs rounded bg-crimson text-black hover:scale-105 transition">Save</button>
        <button className="px-2 py-1 text-xs rounded bg-gray-800 hover:bg-gray-700">Copy</button>
      </div>
    </div>
  )
}
