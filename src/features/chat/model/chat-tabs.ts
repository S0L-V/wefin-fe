import { useEffect, useState } from 'react'

import { useMyGroupQuery } from '@/features/settings/model/use-my-group-query'
import type { SegmentedTabItem } from '@/shared/ui/segmented-tabs'

export type ChatInnerTab = 'group' | 'global'

export const GROUP_TABS: SegmentedTabItem<ChatInnerTab>[] = [
  { key: 'group', label: '그룹' },
  { key: 'global', label: '전체' }
]

export const MEMO_TABS: SegmentedTabItem<ChatInnerTab>[] = [
  { key: 'group', label: '메모' },
  { key: 'global', label: '전체' }
]

function useIsLoggedIn(): boolean {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('accessToken'))

  useEffect(() => {
    const sync = () => setIsLoggedIn(!!localStorage.getItem('accessToken'))
    window.addEventListener('auth-changed', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('auth-changed', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return isLoggedIn
}

export function useChatGroup() {
  const isLoggedIn = useIsLoggedIn()
  const { data: group } = useMyGroupQuery({ enabled: isLoggedIn })
  const hasGroup = isLoggedIn && group != null
  const isHomeGroup = hasGroup && group.isHomeGroup
  return { hasGroup, isHomeGroup }
}
