import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const AUTH_COOKIE_NAME = 'auth-token'
const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'default-secret-change-me'
)

export interface SessionData {
  username: string
  isAuthenticated: boolean
}

export async function createSession(username: string): Promise<string> {
  const token = await new SignJWT({ username, isAuthenticated: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)

  return token
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    const payload = verified.payload

    if (
      typeof payload.username === 'string' &&
      typeof payload.isAuthenticated === 'boolean'
    ) {
      return {
        username: payload.username,
        isAuthenticated: payload.isAuthenticated,
      }
    }

    return null
  } catch (error) {
    return null
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
}

export async function removeAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE_NAME)
}

export function verifyCredentials(username: string, password: string): boolean {
  const validUsername = process.env.AUTH_USERNAME
  const validPassword = process.env.AUTH_PASSWORD

  return username === validUsername && password === validPassword
}
