import { useEffect, useState } from 'react'

import GlobalChatRoom from '@/features/chat/ui/global-chat-room'
import WatchlistPanel from '@/features/watchlist/ui/watchlist-panel'

type Tab = 'watchlist' | 'chat'

interface StockSidebarProps {
  matchHeight?: boolean
}

export default function StockSidebar({ matchHeight }: StockSidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>('watchlist')
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

  const heightClass = matchHeight ? 'h-[calc(100vh-80px)]' : 'h-[calc(100vh-120px)]'

  return (
    <div
      className={`flex ${heightClass} flex-col rounded-2xl border border-wefin-line bg-white shadow-sm`}
    >
      {/* 탭 헤더 */}
      <div className="flex border-b border-wefin-line">
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`flex-1 py-2.5 text-center text-xs font-medium transition-colors ${
            activeTab === 'watchlist'
              ? 'border-b-2 border-wefin-mint text-wefin-mint'
              : 'text-wefin-subtle hover:text-wefin-subtle'
          }`}
        >
          관심 주식
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2.5 text-center text-xs font-medium transition-colors ${
            activeTab === 'chat'
              ? 'border-b-2 border-wefin-mint text-wefin-mint'
              : 'text-wefin-subtle hover:text-wefin-subtle'
          }`}
        >
          전체 채팅
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="relative min-h-0 flex-1">
        {activeTab === 'watchlist' ? (
          <>
            <WatchlistPanel />
            {!isLoggedIn && (
              <div
                className="absolute inset-0 z-10 rounded-b-2xl backdrop-blur-sm"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(255,255,255,0.55) 20%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 80%, transparent 100%)'
                }}
              />
            )}
          </>
        ) : (
          <div className="h-full [&>*]:h-full [&>*]:min-h-0">
            <GlobalChatRoom />
          </div>
        )}
      </div>
    </div>
  )
}
