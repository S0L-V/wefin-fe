import { useEffect, useState } from 'react'

function decodeUserIdFromToken(token: string): string {
  try {
    const payload = token.split('.')[1]

    if (!payload) {
      return ''
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = window.atob(normalized)
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

  // 로그인 후에는 access token의 subject를 채팅 사용자 식별값으로 사용한다.
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
