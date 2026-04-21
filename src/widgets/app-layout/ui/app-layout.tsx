import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import WefinyChatWidget from '@/features/ai-chat/ui/wefini-chat-widget'
import { useAuthUserId } from '@/features/auth/model/use-auth-user-id'
import { useGlobalChatBoot } from '@/features/chat/model/global/use-global-chat-boot'
import { useChatUnreadBoot } from '@/features/chat/model/use-chat-unread-boot'
import { routes } from '@/shared/config/routes'
import FloatingChatButton from '@/widgets/floating-chat/ui/floating-chat-button'
import AppFooter from '@/widgets/footer/ui/app-footer'
import AppHeader from '@/widgets/header/ui/app-header'
import TickerMarquee from '@/widgets/ticker/ui/ticker-marquee'

function AppLayout() {
  const location = useLocation()
  const userId = useAuthUserId()

  useGlobalChatBoot(userId)
  useChatUnreadBoot(userId)

  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_location: window.location.href,
        page_title: document.title
      })
    }
  }, [location.pathname, location.search])

  const shouldShowAiChatWidget =
    location.pathname === routes.home ||
    location.pathname === routes.news ||
    location.pathname.startsWith(`${routes.news}/`) ||
    location.pathname === routes.stocks ||
    location.pathname.startsWith(`${routes.stocks}/`) ||
    location.pathname === routes.chat

  const isStockDetail = location.pathname.startsWith(`${routes.stocks}/`)
  const isFullWidth =
    isStockDetail ||
    location.pathname === routes.history ||
    location.pathname.startsWith(`${routes.history}/`)
  const isCappedWide = location.pathname === routes.stocks

  const mainClass = isFullWidth
    ? 'w-full px-4 pt-2 pb-2 max-md:px-3'
    : isCappedWide
      ? 'mx-auto w-full max-w-[1800px] px-4 pt-2 pb-2 max-md:px-3'
      : 'mx-auto w-[min(1440px,calc(100%-72px))] py-[var(--gutter)] max-md:w-[min(100%,calc(100%-24px))] max-md:py-4'

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      {!isFullWidth && <TickerMarquee />}

      <main className={`flex-1 ${mainClass}`}>
        <Outlet />
      </main>
      {!isFullWidth && <AppFooter />}
      {shouldShowAiChatWidget && <WefinyChatWidget />}
      <FloatingChatButton />
    </div>
  )
}

export default AppLayout
