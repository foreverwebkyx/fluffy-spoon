import { beforeEach, describe, expect, it } from 'vitest'
import foreverDB from '../foreverDB'

beforeEach(() => {
  localStorage.clear()
})

describe('foreverDB basic flows', () => {
  it('creates a user and verifies password', async () => {
    const r = await foreverDB.createUser({ username: 'alice', password: 's3cret' })
    expect(r.ok).toBe(true)
    const v = await foreverDB.verifyPassword('alice', 's3cret')
    expect(v.ok).toBe(true)
    const v2 = await foreverDB.verifyPassword('alice', 'wrong')
    expect(v2.ok).toBe(false)
  })

  it('enables and verifies PIN', async () => {
    await foreverDB.createUser({ username: 'bob', password: 'pw' })
    const e = await foreverDB.enablePin('bob', '1234')
    expect(e.ok).toBe(true)
    const v = await foreverDB.verifyPin('bob', '1234')
    expect(v.ok).toBe(true)
    const v2 = await foreverDB.verifyPin('bob', '0000')
    expect(v2.ok).toBe(false)
  })

  it('generates and verifies OTP', async () => {
    await foreverDB.createUser({ username: 'carol', password: 'x' })
    const o = await foreverDB.sendOTP('carol', 60)
    expect(o.ok).toBe(true)
    expect(o.code).toBeTruthy()
    const r = foreverDB.verifyOTP('carol', o.code)
    expect(r.ok).toBe(true)
  })
})
