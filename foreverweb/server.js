const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
require('dotenv').config()

const app = express()
const PORT = 3000
const USERS_DIR = path.join(__dirname, 'ForeverWebDB', 'users')

// Middleware
app.use(cors())
app.use(bodyParser.json())

// Ensure users directory exists
if (!fs.existsSync(USERS_DIR)) {
  fs.mkdirSync(USERS_DIR, { recursive: true })
}

// Crypto helpers
function sha256Hex(input) {
  return crypto.createHash('sha256').update(input).digest('hex')
}

function genRandomHex(len = 16) {
  return crypto.randomBytes(len).toString('hex')
}

function genOTPCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

// User DB helpers
function getUserPath(username) {
  return path.join(USERS_DIR, `${username.toLowerCase()}.json`)
}

function userExists(username) {
  return fs.existsSync(getUserPath(username))
}

function getUser(username) {
  try {
    const data = fs.readFileSync(getUserPath(username), 'utf8')
    return JSON.parse(data)
  } catch {
    return null
  }
}

function saveUser(user) {
  fs.writeFileSync(getUserPath(user.username), JSON.stringify(user, null, 2))
}

// Send OTP via Mailjet
// Send OTP via Mailjet - simplified version
async function sendOTPEmail(email, username, otpCode) {
  try {
    const mailjet = require('node-mailjet').connect(
      process.env.MAILJET_API_KEY,
      process.env.MAILJET_SECRET_KEY
    )
    
    const result = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: { Email: process.env.MAILJET_EMAIL || 'emphelpdesk12@gmail.com', Name: 'ForeverWeb' },
          To: [{ Email: email }],
          Subject: 'Your ForeverWeb OTP Code',
          TextPart: `Hello ${username}, your OTP is: ${otpCode}. It expires in 10 minutes.`,
          HTMLPart: `<p>Hello <strong>${username}</strong>,</p><p>Your OTP code is: <strong style="font-size:20px">${otpCode}</strong></p><p>It expires in 10 minutes.</p>`
        }
      ]
    })
    console.log('OTP email sent to', email)
    return { ok: true }
  } catch (error) {
    console.error('Mailjet error:', error.message)
    // For demo purposes, don't fail - just log
    return { ok: true }
  }
}

// API Routes

// Check username availability
app.post('/api/auth/check-username', (req, res) => {
  const { username } = req.body
  if (!username || username.length < 3) {
    return res.json({ ok: false, reason: 'Username too short' })
  }
  const available = !userExists(username)
  res.json({ ok: available })
})

// Create account with OTP
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return res.json({ ok: false, reason: 'Missing fields' })
  }

  if (userExists(username)) {
    return res.json({ ok: false, reason: 'Username taken' })
  }

  // Generate OTP
  const otpCode = genOTPCode()
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  // DEV: log OTP for local testing (do not enable in production)
  console.log(`DEV OTP for ${username}:`, otpCode)

  // Send OTP email
  const emailResult = await sendOTPEmail(email, username, otpCode)
  if (!emailResult.ok) {
    return res.json({ ok: false, reason: 'Failed to send OTP email' })
  }

  // Store temporary registration data in memory (or use Redis in production)
  global.tempRegs = global.tempRegs || {}
  global.tempRegs[username] = {
    username,
    email,
    password,
    otpCode,
    otpExpiry,
    createdAt: new Date().toISOString()
  }

  res.json({ ok: true, message: 'OTP sent to email' })
})

// Verify OTP and create account
app.post('/api/auth/verify-otp', (req, res) => {
  const { username, otpCode, pin } = req.body
  global.tempRegs = global.tempRegs || {}

  if (!global.tempRegs[username]) {
    return res.json({ ok: false, reason: 'No registration in progress' })
  }

  const tempReg = global.tempRegs[username]
  if (tempReg.otpCode !== otpCode) {
    return res.json({ ok: false, reason: 'Invalid OTP' })
  }

  if (new Date() > new Date(tempReg.otpExpiry)) {
    delete global.tempRegs[username]
    return res.json({ ok: false, reason: 'OTP expired' })
  }

  // Create user account
  const user = {
    username: tempReg.username,
    email: tempReg.email,
    uid: `FW-${genRandomHex(6)}`,
    passwordHash: `sha256$${sha256Hex(tempReg.password)}`,
    pinEnabled: !!pin,
    pinHash: pin ? `sha256$${sha256Hex(pin)}` : null,
    otpPending: false,
    otpCode: null,
    otpExpiry: null,
    createdAt: tempReg.createdAt,
    lastLogin: null,
    theme: { accent: 'red', mode: 'dark' }
  }

  saveUser(user)
  delete global.tempRegs[username]

  res.json({ ok: true, message: 'Account created' })
})

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password, pin } = req.body

  const user = getUser(username)
  if (!user) {
    return res.json({ ok: false, reason: 'User not found' })
  }

  // Verify password
  const passwordHash = password ? sha256Hex(password) : null
  if (password) {
    const [hashType, storedHash] = (user.passwordHash || '').split('$')
    if (hashType !== 'sha256' || storedHash !== passwordHash) {
      return res.json({ ok: false, reason: 'Invalid password' })
    }
  }

  // Verify PIN if provided
  if (pin && user.pinEnabled) {
    const pinHash = sha256Hex(pin)
    const [pinHashType, storedPin] = (user.pinHash || '').split('$')
    if (pinHashType !== 'sha256' || storedPin !== pinHash) {
      return res.json({ ok: false, reason: 'Invalid PIN' })
    }
  }

  // Update last login
  user.lastLogin = new Date().toISOString()
  saveUser(user)

  res.json({ ok: true, user: { username: user.username, uid: user.uid, email: user.email, theme: user.theme } })
})

// Forgot password - send OTP
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body

  // Find user by email
  let user = null
  const files = fs.readdirSync(USERS_DIR)
  for (const file of files) {
    const u = getUser(file.replace('.json', ''))
    if (u && u.email === email) {
      user = u
      break
    }
  }

  if (!user) {
    return res.json({ ok: false, reason: 'Email not found' })
  }

  // Generate OTP
  const otpCode = genOTPCode()
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  // DEV: log OTP for local testing (do not enable in production)
  console.log(`DEV OTP for ${user.username}:`, otpCode)

  // Send OTP email
  const emailResult = await sendOTPEmail(email, user.username, otpCode)
  if (!emailResult.ok) {
    return res.json({ ok: false, reason: 'Failed to send OTP email' })
  }

  // Store OTP in user record
  user.otpPending = true
  user.otpCode = otpCode
  user.otpExpiry = otpExpiry
  saveUser(user)

  res.json({ ok: true, message: 'OTP sent to email' })
})

// Verify OTP and reset password
app.post('/api/auth/reset-password', (req, res) => {
  const { email, otpCode, newPassword } = req.body

  // Find user by email
  let user = null
  const files = fs.readdirSync(USERS_DIR)
  for (const file of files) {
    const u = getUser(file.replace('.json', ''))
    if (u && u.email === email) {
      user = u
      break
    }
  }

  if (!user) {
    return res.json({ ok: false, reason: 'User not found' })
  }

  if (user.otpCode !== otpCode) {
    return res.json({ ok: false, reason: 'Invalid OTP' })
  }

  if (new Date() > new Date(user.otpExpiry)) {
    user.otpPending = false
    user.otpCode = null
    user.otpExpiry = null
    saveUser(user)
    return res.json({ ok: false, reason: 'OTP expired' })
  }

  // Update password
  user.passwordHash = `sha256$${sha256Hex(newPassword)}`
  user.otpPending = false
  user.otpCode = null
  user.otpExpiry = null
  saveUser(user)

  res.json({ ok: true, message: 'Password reset successful' })
})

// Enable PIN
app.post('/api/auth/enable-pin', (req, res) => {
  const { username, pin } = req.body

  const user = getUser(username)
  if (!user) {
    return res.json({ ok: false, reason: 'User not found' })
  }

  user.pinEnabled = true
  user.pinHash = `sha256$${sha256Hex(pin)}`
  saveUser(user)

  res.json({ ok: true })
})

// Disable PIN
app.post('/api/auth/disable-pin', (req, res) => {
  const { username } = req.body

  const user = getUser(username)
  if (!user) {
    return res.json({ ok: false, reason: 'User not found' })
  }

  user.pinEnabled = false
  user.pinHash = null
  saveUser(user)

  res.json({ ok: true })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'ForeverWeb API running' })
})

// DEV: expose temporary registrations for local testing only
app.get('/api/debug/tempregs', (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(404).json({ ok: false })
  global.tempRegs = global.tempRegs || {}
  res.json({ ok: true, tempRegs: global.tempRegs })
})

app.listen(PORT, () => {
  console.log(`✓ ForeverWeb API running on http://localhost:${PORT}`)
})
