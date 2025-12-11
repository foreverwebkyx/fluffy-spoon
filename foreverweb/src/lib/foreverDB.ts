// foreverDB.ts
// Simple JSON-based local "database" for ForeverWeb stored in localStorage.
// Stores users under key: "ForeverWebDB:user:{username}" and index at "ForeverWebDB:users"

type UserRecord = {
  username: string
  email?: string
  uid: string
  passwordHash?: string | null
  pinEnabled?: boolean
  pinHash?: string | null
  createdAt: string
  lastLogin?: string | null
  theme?: { accent?: string; mode?: 'dark' | 'light' }
}

const USERS_INDEX_KEY = 'ForeverWebDB:users'
const USER_KEY = (username: string) => `ForeverWebDB:user:${username}`
const OTP_KEY = (username: string) => `ForeverWebDB:otp:${username}`

function nowISOString() { return new Date().toISOString() }

function toHex(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

function fromHex(hex: string) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
  return bytes.buffer
}

async function sha256Hex(input: string) {
  const enc = new TextEncoder()
  const data = enc.encode(input)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return toHex(hash)
}

async function pbkdf2Hex(password: string, saltHex: string, iterations = 100000, keyLen = 32) {
  const enc = new TextEncoder()
  const pwKey = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const salt = new Uint8Array(fromHex(saltHex))
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, pwKey, keyLen * 8)
  return toHex(bits)
}

function genRandomHex(len = 16) {
  const arr = new Uint8Array(len)
  crypto.getRandomValues(arr)
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
}

function readIndex(): string[] {
  const raw = localStorage.getItem(USERS_INDEX_KEY)
  if (!raw) return []
  try { return JSON.parse(raw) } catch { return [] }
}

function writeIndex(list: string[]) { localStorage.setItem(USERS_INDEX_KEY, JSON.stringify(list)) }

export const foreverDB = {
  listUsers(): string[] {
    return readIndex()
  },

  userExists(username: string): boolean {
    return localStorage.getItem(USER_KEY(username)) !== null
  },

  getUser(username: string): UserRecord | null {
    const raw = localStorage.getItem(USER_KEY(username))
    if (!raw) return null
    try { return JSON.parse(raw) as UserRecord } catch { return null }
  },

  async createUser(data: { username: string; email?: string; password?: string; theme?: any }): Promise<{ ok: boolean; reason?: string }>{
    const uname = data.username.trim()
    if (!uname) return { ok: false, reason: 'username required' }
    if (foreverDB.userExists(uname)) return { ok: false, reason: 'taken' }

    const uid = `FW-${genRandomHex(6)}`
    let passwordHash: string | undefined
    if (data.password) {
      // use PBKDF2 with random salt
      const salt = genRandomHex(12)
      const iter = 100000
      const hex = await pbkdf2Hex(data.password, salt, iter)
      // store as pbkdf2$iterations$salt$hex
      passwordHash = `pbkdf2$${iter}$${salt}$${hex}`
    }

    const user: UserRecord = {
      username: uname,
      email: data.email || undefined,
      uid,
      passwordHash: passwordHash || null,
      pinEnabled: false,
      pinHash: null,
      createdAt: nowISOString(),
      lastLogin: null,
      theme: data.theme || { accent: 'red', mode: 'dark' }
    }

    localStorage.setItem(USER_KEY(uname), JSON.stringify(user))
    const idx = readIndex()
    idx.push(uname)
    writeIndex(idx)
    return { ok: true }
  },

  async deleteUser(username: string) {
    localStorage.removeItem(USER_KEY(username))
    const idx = readIndex().filter(u => u !== username)
    writeIndex(idx)
    localStorage.removeItem(OTP_KEY(username))
    return true
  },

  async setPassword(username: string, password: string) {
    const user = foreverDB.getUser(username)
    if (!user) return { ok: false, reason: 'not found' }
    const salt = genRandomHex(12)
    const iter = 100000
    const hex = await pbkdf2Hex(password, salt, iter)
    user.passwordHash = `pbkdf2$${iter}$${salt}$${hex}`
    localStorage.setItem(USER_KEY(username), JSON.stringify(user))
    return { ok: true }
  },

  async verifyPassword(username: string, password: string): Promise<{ ok: boolean; reason?: string }> {
    const user = foreverDB.getUser(username)
    if (!user) return { ok: false, reason: 'not found' }
    if (!user.passwordHash) return { ok: false, reason: 'no-password' }
    const parts = (user.passwordHash || '').split('$')
    if (parts[0] === 'pbkdf2') {
      const iter = Number(parts[1] || 100000)
      const salt = parts[2]
      const expected = parts[3]
      const hex = await pbkdf2Hex(password, salt, iter)
      return { ok: hex === expected }
    }
    if (parts[0] === 'sha256') {
      const expected = parts[1]
      const hex = await sha256Hex(password)
      return { ok: hex === expected }
    }
    return { ok: false, reason: 'unknown-hash' }
  },

  async enablePin(username: string, pin: string) {
    const user = foreverDB.getUser(username)
    if (!user) return { ok: false, reason: 'not found' }
    const hex = await sha256Hex(pin)
    user.pinEnabled = true
    user.pinHash = `sha256$${hex}`
    localStorage.setItem(USER_KEY(username), JSON.stringify(user))
    return { ok: true }
  },

  async disablePin(username: string) {
    const user = foreverDB.getUser(username)
    if (!user) return { ok: false, reason: 'not found' }
    user.pinEnabled = false
    user.pinHash = null
    localStorage.setItem(USER_KEY(username), JSON.stringify(user))
    return { ok: true }
  },

  async verifyPin(username: string, pin: string): Promise<{ ok: boolean }>{
    const user = foreverDB.getUser(username)
    if (!user || !user.pinEnabled || !user.pinHash) return { ok: false }
    const parts = user.pinHash.split('$')
    if (parts[0] === 'sha256') {
      const expected = parts[1]
      const hex = await sha256Hex(pin)
      return { ok: hex === expected }
    }
    return { ok: false }
  },

  async sendOTP(username: string, ttlSeconds = 600) {
    // Generate 6-digit code, store with expiry in localStorage
    const code = String(Math.floor(100000 + Math.random() * 900000))
    const expiresAt = Date.now() + ttlSeconds * 1000
    const payload = { code, expiresAt }
    localStorage.setItem(OTP_KEY(username), JSON.stringify(payload))
    // In real system, send via email. Here we return it for demo/testing.
    return { ok: true, code, expiresAt }
  },

  verifyOTP(username: string, code: string) {
    const raw = localStorage.getItem(OTP_KEY(username))
    if (!raw) return { ok: false, reason: 'no-otp' }
    try {
      const obj = JSON.parse(raw)
      if (Date.now() > obj.expiresAt) { localStorage.removeItem(OTP_KEY(username)); return { ok: false, reason: 'expired' } }
      if (obj.code === code) { localStorage.removeItem(OTP_KEY(username)); return { ok: true } }
      return { ok: false, reason: 'mismatch' }
    } catch { return { ok: false, reason: 'invalid' } }
  },

  updateLastLogin(username: string) {
    const user = foreverDB.getUser(username)
    if (!user) return false
    user.lastLogin = nowISOString()
    localStorage.setItem(USER_KEY(username), JSON.stringify(user))
    return true
  }
}

export default foreverDB
