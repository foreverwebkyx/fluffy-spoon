import React, { useState, useEffect } from 'react'

interface Notification {
  id: number
  title: string
  message: string
  type: 'success' | 'warning' | 'error' | 'info'
  duration: number
  timestamp: Date
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    window.addEventListener('forever-notify', (e: any) => {
      const notif: Notification = {
        id: Date.now(),
        title: e.detail?.title || 'Notification',
        message: e.detail?.message || '',
        type: e.detail?.type || 'info',
        duration: e.detail?.duration || 4000,
        timestamp: new Date()
      }
      addNotification(notif)
    })
  }, [])

  const addNotification = (notif: Notification) => {
    setNotifications(n => [...n, notif])
    if (notif.duration > 0) {
      setTimeout(() => {
        setNotifications(n => n.filter(i => i.id !== notif.id))
      }, notif.duration)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-500 bg-green-500/10'
      case 'warning': return 'border-yellow-500 bg-yellow-500/10'
      case 'error': return 'border-red-500 bg-red-500/10'
      default: return 'border-crimson bg-crimson/10'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✓'
      case 'warning': return '!'
      case 'error': return '✕'
      default: return 'ℹ'
    }
  }

  return (
    <div className="fixed bottom-20 right-4 space-y-2 z-50 max-w-sm">
      {/* Floating Toasts */}
      {notifications.map(notif => (
        <div key={notif.id} className={`border ${getTypeColor(notif.type)} rounded p-3 animate-windowEnter`}>
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">{getTypeIcon(notif.type)}</span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-200">{notif.title}</div>
              <div className="text-sm text-gray-400">{notif.message}</div>
            </div>
            <button
              onClick={() => setNotifications(n => n.filter(i => i.id !== notif.id))}
              className="text-gray-500 hover:text-gray-300 flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      {/* History Panel */}
      {showHistory && (
        <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-gray-900 border border-crimson/30 rounded shadow-xl overflow-auto z-50">
          <div className="sticky top-0 bg-black/60 border-b border-gray-700 p-3 flex items-center justify-between">
            <h3 className="font-bold text-gray-200">Notification History</h3>
            <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-gray-200">✕</button>
          </div>
          <div className="p-3 space-y-2 max-h-80 overflow-auto">
            {notifications.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-4">No notifications</div>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} className={`border-l-2 pl-3 py-2 border-gray-700`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-300 text-sm">{notif.title}</div>
                      <div className="text-xs text-gray-500">{notif.message}</div>
                      <div className="text-xs text-gray-600 mt-1">{notif.timestamp.toLocaleTimeString()}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
