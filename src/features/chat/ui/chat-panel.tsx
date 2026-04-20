import { useEffect, useState } from 'react'

import GlobalChatRoom from '@/features/chat/ui/global-chat-room'
import GroupChatRoom from '@/features/chat/ui/group-chat-room'
import { useMyGroupQuery } from '@/features/settings/model/use-my-group-query'
import SegmentedTabs, { type SegmentedTabItem } from '@/shared/ui/segmented-tabs'

type InnerTab = 'group' | 'global'

const GROUP_TABS: SegmentedTabItem<InnerTab>[] = [
  { key: 'group', label: '그룹' },
  { key: 'global', label: '전체' }
]

const MEMO_TABS: SegmentedTabItem<InnerTab>[] = [
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

export default function ChatPanel() {
  const isLoggedIn = useIsLoggedIn()
  const { data: group } = useMyGroupQuery({ enabled: isLoggedIn })
  const hasGroup = isLoggedIn && group != null
  const isHomeGroup = hasGroup && group.isHomeGroup
  const tabs = isHomeGroup ? MEMO_TABS : GROUP_TABS

  const [innerTab, setInnerTab] = useState<InnerTab>(isHomeGroup ? 'global' : 'group')
  const [prevIsHomeGroup, setPrevIsHomeGroup] = useState(isHomeGroup)
  if (prevIsHomeGroup !== isHomeGroup) {
    setPrevIsHomeGroup(isHomeGroup)
    setInnerTab(isHomeGroup ? 'global' : 'group')
  }

  if (!hasGroup) {
    return <GlobalChatRoom bare />
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 justify-center px-3 pt-2 pb-1">
        <SegmentedTabs items={tabs} activeKey={innerTab} onChange={setInnerTab} />
      </div>
      <div className="min-h-0 flex-1">
        {innerTab === 'group' ? <GroupChatRoom bare /> : <GlobalChatRoom bare />}
      </div>
    </div>
  )
}
