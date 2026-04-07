import { useEffect, useState } from 'react'

const FALLBACK_USER_ID = '11111111-1111-1111-1111-111111111111'
const STORAGE_KEY = 'wefin-demo-user-id'

export function useDemoUserId() {
  const [userId, setUserId] = useState(() => {
    if (typeof window === 'undefined') {
      return FALLBACK_USER_ID
    }

    return window.sessionStorage.getItem(STORAGE_KEY) ?? ''
  })

  useEffect(() => {
    if (typeof window === 'undefined' || userId) {
      return
    }

    // 데모용 사용자 ID를 세션에 보관해서
    // 같은 탭 안에서는 재사용하고 새로 열면 다시 입력받는다.
    const inputUserId = window
      .prompt('채팅에 사용할 userId를 입력하세요. 비워두면 자동으로 생성합니다.')
      ?.trim()
    const generatedUserId = window.crypto?.randomUUID?.() ?? FALLBACK_USER_ID
    const nextUserId = inputUserId || generatedUserId

    window.sessionStorage.setItem(STORAGE_KEY, nextUserId)
    queueMicrotask(() => {
      setUserId(nextUserId)
    })
  }, [userId])

  return userId || FALLBACK_USER_ID
}
