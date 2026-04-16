import { useEffect, useState } from 'react'

import GlobalChatRoom from '@/features/chat/ui/global-chat-room'
import GroupChatRoom from '@/features/chat/ui/group-chat-room'
import { useMyGroupQuery } from '@/features/settings/model/use-my-group-query'
import SegmentedTabs, { type SegmentedTabItem } from '@/shared/ui/segmented-tabs'

type InnerTab = 'group' | 'global'

const TABS: SegmentedTabItem<InnerTab>[] = [
  { key: 'group', label: '그룹' },
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

export default function ChatPanel() {
  const isLoggedIn = useIsLoggedIn()
  const { data: group } = useMyGroupQuery({ enabled: isLoggedIn })
  const canUseGroupChat = isLoggedIn && group != null && !group.isHomeGroup

  const [innerTab, setInnerTab] = useState<InnerTab>('group')
  // 멤버십 변할 때 적절한 탭으로 자동 전환
  const [prevCanUseGroup, setPrevCanUseGroup] = useState<boolean | null>(null)
  if (prevCanUseGroup !== canUseGroupChat) {
    setPrevCanUseGroup(canUseGroupChat)
    setInnerTab(canUseGroupChat ? 'group' : 'global')
  }

  // 비그룹/비로그인은 토글 없이 전체 채팅만
  if (!canUseGroupChat) {
    return <GlobalChatRoom bare />
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 justify-center px-3 pt-2 pb-1">
        <SegmentedTabs items={TABS} activeKey={innerTab} onChange={setInnerTab} />
      </div>
      <div className="min-h-0 flex-1">
        {innerTab === 'group' ? <GroupChatRoom bare /> : <GlobalChatRoom bare />}
      </div>
    </div>
  )
}
