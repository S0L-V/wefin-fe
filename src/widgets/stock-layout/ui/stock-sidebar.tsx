import { useState } from 'react'

import GlobalChatRoom from '@/features/chat/ui/global-chat-room'

type Tab = 'watchlist' | 'chat'

export default function StockSidebar() {
  const [activeTab, setActiveTab] = useState<Tab>('watchlist')

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col rounded-3xl border border-gray-200 bg-white shadow-sm">
      {/* 탭 헤더 */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
            activeTab === 'watchlist'
              ? 'border-b-2 border-wefin-mint text-wefin-mint'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          관심 주식
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
            activeTab === 'chat'
              ? 'border-b-2 border-wefin-mint text-wefin-mint'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          전체 채팅
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="min-h-0 flex-1">
        {activeTab === 'watchlist' ? (
          <WatchlistPanel />
        ) : (
          <div className="h-full [&>*]:h-full [&>*]:min-h-0">
            <GlobalChatRoom />
          </div>
        )}
      </div>
    </div>
  )
}

function WatchlistPanel() {
  return <div className="p-4 text-center text-sm text-gray-400">관심 종목이 없습니다.</div>
}
