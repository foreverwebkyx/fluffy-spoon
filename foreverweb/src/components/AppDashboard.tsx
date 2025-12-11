import React from 'react'
import { APP_REGISTRY } from '../lib/appLoader'

export default function AppDashboard({ open }: { open: boolean }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-50 w-[min(900px,95%)] max-h-[90vh] overflow-auto p-6 rounded-2xl bg-black/60 border border-crimson/20 shadow-2xl animate-window-enter">
        <h2 className="text-xl text-crimson mb-4">App Dashboard</h2>
        <div className="grid grid-cols-4 gap-4">
          {APP_REGISTRY.map(a => (
            <div key={a.id} className="p-4 rounded-lg bg-black/40 border border-crimson/10 hover:scale-105 transform transition cursor-pointer hover:bg-crimson/10">
              <div className="text-4xl mb-2">{a.icon}</div>
              <div className="text-sm text-gray-300">{a.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
