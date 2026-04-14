import { Outlet, useLocation } from 'react-router-dom'

import WefinyChatWidget from '@/features/ai-chat/ui/wefini-chat-widget'
import { useAuthUserId } from '@/features/auth/model/use-auth-user-id'
import { useGlobalChatBoot } from '@/features/chat/model/global/use-global-chat-boot'
import { routes } from '@/shared/config/routes'
import AppHeader from '@/widgets/header/ui/app-header'

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

  return (
    <div className="min-h-screen bg-wefin-bg">
      <AppHeader />

      <main className="mx-auto w-[min(1400px,calc(100%-32px))] pt-2 pb-2 max-md:w-[min(100%,calc(100%-24px))] max-md:pt-2">
        <Outlet />
      </main>
      {shouldShowAiChatWidget && <WefinyChatWidget />}
    </div>
  )
}

export default AppLayout
