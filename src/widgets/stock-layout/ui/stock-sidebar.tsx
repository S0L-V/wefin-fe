import { Maximize2, Minimize2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import ChatPanel from '@/features/chat/ui/chat-panel'
import WatchlistPanel from '@/features/watchlist/ui/watchlist-panel'

type Tab = 'watchlist' | 'chat'

const TABS: { key: Tab; label: string }[] = [
  { key: 'watchlist', label: '관심 주식' },
  { key: 'chat', label: '채팅' }
]

interface StockSidebarProps {
  matchHeight?: boolean
}

export default function StockSidebar({ matchHeight }: StockSidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>('watchlist')
  const [expanded, setExpanded] = useState(false)
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
      className={`flex flex-col rounded-2xl border border-wefin-line bg-white shadow-sm transition-all duration-300 ${
        expanded
          ? 'fixed right-6 bottom-6 z-30 h-[calc(100vh-100px)] w-[420px] shadow-[0_16px_48px_rgba(0,0,0,0.12)]'
          : heightClass
      }`}
    >
      {/* 탭 헤더 */}
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
            <ChatPanel />
          </div>
        )}
      </div>
    </div>
  )
}
