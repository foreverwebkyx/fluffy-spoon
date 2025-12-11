import React, { useState } from 'react'

export default function GalleryApp() {
  const [images] = useState([
    { id: 1, title: 'Crimson Sunset', thumb: '🌅' },
    { id: 2, title: 'Neon City', thumb: '🌃' },
    { id: 3, title: 'Digital Ocean', thumb: '🌊' },
    { id: 4, title: 'Starry Night', thumb: '🌌' },
    { id: 5, title: 'Forest Trail', thumb: '🌲' },
    { id: 6, title: 'Mountain Peak', thumb: '⛰️' }
  ])
  const [selected, setSelected] = useState(0)
  const [slideshow, setSlideshow] = useState(false)

  return (
    <div className="w-full h-full flex flex-col bg-black/40">
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-8xl">{images[selected].thumb}</div>
      </div>

      <div className="border-t border-gray-700 p-3">
        <div className="text-sm text-gray-300 mb-2">{images[selected].title}</div>
        <div className="flex gap-2 mb-2">
          <button onClick={() => setSelected(Math.max(0, selected - 1))} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-xs">← Previous</button>
          <button onClick={() => setSlideshow(!slideshow)} className="px-3 py-1 rounded bg-crimson/40 text-xs">{slideshow ? 'Stop Slideshow' : 'Play Slideshow'}</button>
          <button onClick={() => setSelected(Math.min(images.length - 1, selected + 1))} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-xs">Next →</button>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {images.map((img, i) => (
            <button key={img.id} onClick={() => setSelected(i)} className={`p-2 rounded text-2xl ${i === selected ? 'border-2 border-crimson' : 'border border-gray-600'}`}>
              {img.thumb}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
