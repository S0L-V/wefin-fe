import { useState } from 'react'

import SegmentedTabs from '@/shared/ui/segmented-tabs'

import type { ChatInnerTab } from '../model/chat-tabs'
import { GROUP_TABS, MEMO_TABS, useChatGroup } from '../model/chat-tabs'
import GlobalChatRoom from './global-chat-room'
import GroupChatRoom from './group-chat-room'

export default function ChatPanel() {
  const { hasGroup, isHomeGroup } = useChatGroup()
  const tabs = isHomeGroup ? MEMO_TABS : GROUP_TABS

  const [innerTab, setInnerTab] = useState<ChatInnerTab>('global')
  const [prevIsHomeGroup, setPrevIsHomeGroup] = useState(isHomeGroup)
  if (prevIsHomeGroup !== isHomeGroup) {
    setPrevIsHomeGroup(isHomeGroup)
    if (isHomeGroup) setInnerTab('global')
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
