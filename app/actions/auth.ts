'use server'

import { redirect } from 'next/navigation'
import { verifyCredentials, createSession, setAuthCookie, removeAuthCookie } from '@/lib/auth'

export async function login(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    return { error: 'Username and password are required' }
  }

  if (!verifyCredentials(username, password)) {
    return { error: 'Invalid username or password' }
  }

  const token = await createSession(username)
  await setAuthCookie(token)

  redirect('/')
}

export async function logout() {
  await removeAuthCookie()
  redirect('/login')
}
