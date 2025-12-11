const _RAW_API = (import.meta as any).env?.VITE_API_URL
let API_URL: string
if (typeof window === 'undefined') {
  // server-side / build-time: use provided URL or localhost
  API_URL = _RAW_API || 'http://localhost:3000'
} else {
  // browser: prefer the Vite dev proxy unless a non-localhost URL is configured
  if (_RAW_API && !/localhost|127\.0\.0\.1/.test(_RAW_API)) API_URL = _RAW_API
  else API_URL = '/api'
}

export const authAPI = {
  async checkUsername(username: string) {
    try {
      const res = await fetch(`${API_URL}/api/auth/check-username`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      })
      return res.json()
    } catch (err) {
      return { ok: false, reason: 'network' }
    }
  },

  async register(username: string, email: string, password: string) {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })
      return res.json()
    } catch (err) {
      return { ok: false, reason: 'network' }
    }
  },

  async verifyOTP(username: string, otpCode: string, pin?: string) {
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, otpCode, pin })
      })
      return res.json()
    } catch (err) {
      return { ok: false, reason: 'network' }
    }
  },

  async login(username: string, password: string, pin?: string) {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, pin })
      })
      return res.json()
    } catch (err) {
      return { ok: false, reason: 'network' }
    }
  },

  async forgotPassword(email: string) {
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      return res.json()
    } catch (err) {
      return { ok: false, reason: 'network' }
    }
  },

  async resetPassword(email: string, otpCode: string, newPassword: string) {
    const res = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otpCode, newPassword })
    })
    return res.json()
  },

  async enablePin(username: string, pin: string) {
    const res = await fetch(`${API_URL}/api/auth/enable-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, pin })
    })
    return res.json()
  },

  async disablePin(username: string) {
    const res = await fetch(`${API_URL}/api/auth/disable-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    })
    return res.json()
  }
}
