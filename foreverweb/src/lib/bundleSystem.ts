// App bundling system using fflate
import { strToU8, strFromU8 } from 'fflate'

export interface AppBundle {
  id: string
  name: string
  version: string
  author: string
  description: string
  permissions: string[]
  entry: string
  icon: string
}

export const bundleSystem = {
  // Simple bundle creation (JSON + zipped data)
  pack: async (manifest: AppBundle, files: Record<string, string>): Promise<Uint8Array> => {
    const bundle = {
      manifest,
      files
    }
    const json = JSON.stringify(bundle)
    return strToU8(json)
  },

  // Unpack bundle
  unpack: async (data: Uint8Array): Promise<{ manifest: AppBundle; files: Record<string, string> }> => {
    const json = strFromU8(data)
    const bundle = JSON.parse(json)
    return { manifest: bundle.manifest, files: bundle.files }
  },

  // Save bundle locally
  saveBundle: async (id: string, data: Uint8Array) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open('ForeverAppStore', 1)
      req.onerror = () => reject(req.error)
      req.onsuccess = () => resolve(req.result)
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains('bundles')) {
          req.result.createObjectStore('bundles')
        }
      }
    })
    return new Promise((resolve, reject) => {
      const tx = db.transaction('bundles', 'readwrite')
      const store = tx.objectStore('bundles')
      const req = store.put({ id, data, timestamp: Date.now() }, id)
      req.onerror = () => reject(req.error)
      req.onsuccess = () => resolve(true)
    })
  },

  // Load bundle from local storage
  loadBundle: async (id: string): Promise<Uint8Array | null> => {
    try {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const req = indexedDB.open('ForeverAppStore', 1)
        req.onerror = () => reject(req.error)
        req.onsuccess = () => resolve(req.result)
      })
      return new Promise((resolve) => {
        const tx = db.transaction('bundles', 'readonly')
        const store = tx.objectStore('bundles')
        const req = store.get(id)
        req.onsuccess = () => resolve(req.result?.data || null)
      })
    } catch {
      return null
    }
  }
}
