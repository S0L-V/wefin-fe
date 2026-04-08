import { useEffect, useState } from 'react'

function decodeUserIdFromToken(token: string): string {
  try {
    const payload = token.split('.')[1]

    if (!payload) {
      return ''
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')

    // �α��� access token�� subject�� ���� ä�� ����� �ĺ������� ����Ѵ�.
    const decoded = window.atob(padded)
    const parsed = JSON.parse(decoded) as { sub?: string }

    return typeof parsed.sub === 'string' ? parsed.sub : ''
  } catch {
    return ''
  }
}

function getLoggedInUserId(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  const token = window.localStorage.getItem('accessToken')

  if (!token) {
    return ''
  }

  return decodeUserIdFromToken(token)
}

export function useDemoUserId() {
  const [userId, setUserId] = useState(() => getLoggedInUserId())

  useEffect(() => {
    const syncUserId = () => {
      setUserId(getLoggedInUserId())
    }

    window.addEventListener('auth-changed', syncUserId)
    window.addEventListener('storage', syncUserId)

    return () => {
      window.removeEventListener('auth-changed', syncUserId)
      window.removeEventListener('storage', syncUserId)
    }
  }, [])

  return userId
}
