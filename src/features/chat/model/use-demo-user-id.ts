import { useMemo } from 'react'

const FALLBACK_USER_ID = '11111111-1111-1111-1111-111111111111'
const STORAGE_KEY = 'wefin-demo-user-id'

export function useDemoUserId() {
  return useMemo(() => {
    if (typeof window === 'undefined') {
      return FALLBACK_USER_ID
    }

    // We keep the demo user id in localStorage so route changes reuse the
    // same websocket identity instead of prompting again on every page.
    const savedUserId = window.localStorage.getItem(STORAGE_KEY)
    if (savedUserId) {
      return savedUserId
    }

    const inputUserId = window.prompt('Enter demo userId')?.trim()
    const userId = inputUserId || FALLBACK_USER_ID
    window.localStorage.setItem(STORAGE_KEY, userId)
    return userId
  }, [])
}
