// Forever IPC / Message Bus API
type MessageHandler = (data: unknown) => void

const listeners: Record<string, MessageHandler[]> = {}

export const forever = {
  ipc: {
    send: (channel: string, data: unknown) => {
      console.log(`[IPC Send] ${channel}:`, data)
      // dispatch to local listeners
      if (listeners[channel]) {
        listeners[channel].forEach(fn => fn(data))
      }
    },

    on: (channel: string, handler: MessageHandler) => {
      if (!listeners[channel]) listeners[channel] = []
      listeners[channel].push(handler)
      return () => {
        listeners[channel] = listeners[channel].filter(h => h !== handler)
      }
    }
  },

  notify: {
    show: (title: string, opts?: { body?: string; icon?: string }) => {
      console.log(`[Notification] ${title}:`, opts?.body || '')
      // future: dispatch to OS notification center
    }
  },

  fs: {
    read: async (path: string) => {
      console.log(`[FS] read: ${path}`)
      return 'file contents'
    },
    write: async (path: string, data: string) => {
      console.log(`[FS] write: ${path}`)
    },
    list: async (path: string) => {
      console.log(`[FS] list: ${path}`)
      return []
    }
  },

  settings: {
    get: (key: string, def?: unknown) => localStorage.getItem(`forever:${key}`) || def,
    set: (key: string, value: unknown) => localStorage.setItem(`forever:${key}`, String(value))
  }
}

// Expose on window for apps
;(window as any).forever = forever
