import { Maximize2, Minimize2 } from 'lucide-react'
import { useState } from 'react'

import ChatPanel from '@/features/chat/ui/chat-panel'
import DailyQuestPanel from '@/features/quest/ui/daily-quest-panel'
import UserRankingTable from '@/features/user-ranking/ui/user-ranking-table'

type SidebarTab = 'chat' | 'ranking'

const TABS: { key: SidebarTab; label: string }[] = [
  { key: 'chat', label: '채팅' },
  { key: 'ranking', label: 'TOP 10' }
]

export default function HomeSidebar() {
  const [activeTab, setActiveTab] = useState<SidebarTab>('chat')
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <DailyQuestPanel />

      <div
        className={`flex min-h-0 flex-col overflow-hidden rounded-3xl bg-white transition-all duration-300 ${
          expanded
            ? 'fixed right-6 bottom-6 z-30 h-[calc(100vh-100px)] w-[420px] shadow-[0_16px_48px_rgba(0,0,0,0.12)]'
            : 'h-[688px]'
        }`}
      >
        <div className="flex items-center gap-2 p-2.5">
          <div className="flex flex-1 gap-1 rounded-full bg-gray-100 p-1">
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
          {activeTab === 'chat' && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-wefin-subtle transition-colors hover:bg-wefin-bg hover:text-wefin-text"
              aria-label={expanded ? '채팅 축소' : '채팅 확대'}
            >
              {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          {activeTab === 'chat' && <ChatPanel />}
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
