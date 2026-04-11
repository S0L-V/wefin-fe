import { useState } from 'react'

import GlobalChatRoom from '@/features/chat/ui/global-chat-room'
import GroupChatRoom from '@/features/chat/ui/group-chat-room'

type ChatTab = 'group' | 'global'

function ChatPage() {
  const [activeTab, setActiveTab] = useState<ChatTab>('group')

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col">
      <div className="mb-6 border-b border-gray-200 pb-2">
        <h2 className="mb-5 text-2xl font-bold text-gray-900">채팅</h2>

        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('group')}
            className={`relative pb-3 text-lg font-bold transition-colors ${
              activeTab === 'group' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            그룹 채팅
            {activeTab === 'group' && (
              <span className="absolute right-0 bottom-0 left-0 h-[3px] rounded-full bg-gray-900" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('global')}
            className={`relative pb-3 text-lg font-bold transition-colors ${
              activeTab === 'global' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            전체 채팅
            {activeTab === 'global' && (
              <span className="absolute right-0 bottom-0 left-0 h-[3px] rounded-full bg-gray-900" />
            )}
          </button>
        </div>
      </div>

      {/* 채팅 페이지 안에서 그룹/전체 채팅을 탭으로 전환해 같은 레이아웃 안에서 보여준다. */}
      {activeTab === 'group' ? <GroupChatRoom /> : <GlobalChatRoom />}
    </div>
  )
}

export default ChatPage
