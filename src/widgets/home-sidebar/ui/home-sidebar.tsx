import { useState } from 'react'

import GlobalChatRoom from '@/features/chat/ui/global-chat-room'
import DailyQuestPanel from '@/features/quest/ui/daily-quest-panel'
import UserRankingTable from '@/features/user-ranking/ui/user-ranking-table'

type SidebarTab = 'chat' | 'ranking'

const TABS: { key: SidebarTab; label: string }[] = [
  { key: 'chat', label: '전체 채팅' },
  { key: 'ranking', label: 'TOP 10' }
]

export default function HomeSidebar() {
  const [activeTab, setActiveTab] = useState<SidebarTab>('chat')

  return (
    <div className="flex flex-col gap-4">
      <DailyQuestPanel />

      <div className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-wefin-line bg-white shadow-sm">
        <div className="p-2.5">
          <div className="flex gap-1 rounded-full bg-gray-100 p-1">
            {TABS.map(({ key, label }) => {
              const isActive = activeTab === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 rounded-full py-2 text-sm font-bold transition-colors ${
                    isActive
                      ? 'bg-white text-wefin-text shadow-sm'
                      : 'text-wefin-subtle hover:text-wefin-text'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          {activeTab === 'chat' && <GlobalChatRoom />}
          {activeTab === 'ranking' && (
            <div className="h-full overflow-y-auto p-4">
              <UserRankingTable />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
