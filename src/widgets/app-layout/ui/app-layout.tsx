import { Outlet, useLocation } from 'react-router-dom'

import WefinyChatWidget from '@/features/ai-chat/ui/wefini-chat-widget'
import { useAuthUserId } from '@/features/auth/model/use-auth-user-id'
import { useGlobalChatBoot } from '@/features/chat/model/global/use-global-chat-boot'
import { routes } from '@/shared/config/routes'
import AppFooter from '@/widgets/footer/ui/app-footer'
import AppHeader from '@/widgets/header/ui/app-header'
import TickerMarquee from '@/widgets/ticker/ui/ticker-marquee'

function AppLayout() {
  const location = useLocation()
  const userId = useAuthUserId()

  useGlobalChatBoot(userId)

  const shouldShowAiChatWidget =
    location.pathname === routes.home ||
    location.pathname === routes.news ||
    location.pathname.startsWith(`${routes.news}/`) ||
    location.pathname === routes.stocks ||
    location.pathname.startsWith(`${routes.stocks}/`) ||
    location.pathname === routes.chat

  const isFullWidth =
    location.pathname === routes.stocks ||
    location.pathname.startsWith(`${routes.stocks}/`) ||
    location.pathname === routes.history ||
    location.pathname.startsWith(`${routes.history}/`)

  const mainClass = isFullWidth
    ? 'w-full px-4 pt-2 pb-2 max-md:px-3'
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
    </div>
  )
}

export default AppLayout
