import React, { useState } from 'react'

export default function BrowserApp() {
  const [url, setUrl] = useState('https://example.com')

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-2 border-b border-gray-800 flex gap-2">
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          className="flex-1 px-2 py-1 rounded bg-gray-900/60 text-gray-300 text-sm border border-gray-800 focus:outline-none focus:border-crimson"
          placeholder="Enter URL..."
        />
        <button className="px-3 py-1 text-xs rounded bg-crimson text-black hover:scale-105 transition">Go</button>
      </div>
      <div className="flex-1 p-4 bg-black/40 flex items-center justify-center text-gray-400">
        Browser sandbox — would load {url}
      </div>
    </div>
  )
}
