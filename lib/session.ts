import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export interface Session {
  coupleId: string
  slot: 'A' | 'B'
  myName: string
  partnerName: string
}

const COOKIE = 'together_session'
const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET!)

export async function signSession(payload: Session): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('365d')
    .sign(secret())
}

export async function getSession(): Promise<Session | null> {
  try {
    const store = await cookies()
    const token = store.get(COOKIE)?.value
    if (!token) return null
    const { payload } = await jwtVerify(token, secret())
    return payload as unknown as Session
  } catch {
    return null
  }
}

export function sessionCookieHeader(token: string) {
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${365 * 24 * 3600}`
}
