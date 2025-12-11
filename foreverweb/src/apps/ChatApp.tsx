import React, { useState, useRef, useEffect } from 'react'

export default function ChatApp() {
  const [messages, setMessages] = useState<Array<{ id: number; user: string; text: string; time: string }>>([
    { id: 1, user: 'System', text: 'Welcome to ForeverWeb Chat! Click the AI button to chat with ChatGPT.', time: '12:00' }
  ])
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'chat' | 'ai'>('chat')
  const messagesEnd = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    const msg = {
      id: messages.length + 1,
      user: mode === 'ai' ? 'You' : 'User',
      text: input,
      time: new Date().toLocaleTimeString().slice(0, 5)
    }
    setMessages([...messages, msg])

    if (mode === 'ai') {
      setTimeout(() => {
        setMessages(m => [...m, {
          id: m.length + 1,
          user: 'ChatGPT',
          text: 'This is a demo response. Connect to OpenAI API for real ChatGPT responses.',
          time: new Date().toLocaleTimeString().slice(0, 5)
        }])
      }, 500)
    }
    setInput('')
  }

  return (
    <div className="w-full h-full flex flex-col bg-black/40">
      <div className="border-b border-gray-700 p-3 flex gap-2">
        <button onClick={() => setMode('chat')} className={`px-3 py-1 rounded text-sm ${mode === 'chat' ? 'bg-crimson text-black' : 'bg-gray-700'}`}>Messages</button>
        <button onClick={() => setMode('ai')} className={`px-3 py-1 rounded text-sm ${mode === 'ai' ? 'bg-crimson text-black' : 'bg-gray-700'}`}>ChatGPT</button>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-2">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.user === 'You' || msg.user === 'User' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs p-2 rounded text-sm ${msg.user === 'You' || msg.user === 'User' ? 'bg-crimson/30' : 'bg-gray-800'}`}>
              <div className="text-xs text-gray-400">{msg.user} {msg.time}</div>
              <div className="text-gray-200">{msg.text}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEnd} />
      </div>

      <div className="border-t border-gray-700 p-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 rounded bg-gray-900/60 border border-gray-700 focus:outline-none focus:border-crimson text-sm"
        />
        <button onClick={handleSend} className="px-4 py-2 rounded bg-crimson text-black font-semibold hover:scale-105">Send</button>
      </div>
    </div>
  )
}
