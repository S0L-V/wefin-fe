import { Outlet, useLocation } from 'react-router-dom'

import WefinyChatWidget from '@/features/ai-chat/ui/wefiny-chat-widget'
import { useDemoUserId } from '@/features/chat/model/global/use-demo-user-id'
import { useGlobalChatBoot } from '@/features/chat/model/global/use-global-chat-boot'
import { routes } from '@/shared/config/routes'
import AppHeader from '@/widgets/header/ui/app-header'

function AppLayout() {
  const location = useLocation()
  const userId = useDemoUserId()

  // AppLayout은 라우트 전환 중에도 유지되는 부모 레이아웃이라서
  // 하위 페이지가 바뀌는 동안 공용 글로벌 채팅 연결을 계속 유지하기에 가장 적합하다.
  useGlobalChatBoot(userId)

  const shouldShowAiChatWidget =
    location.pathname === routes.home ||
    location.pathname === routes.stocks ||
    location.pathname.startsWith(`${routes.stocks}/`) ||
    location.pathname === routes.chat

  return (
    <div className="min-h-screen bg-wefin-bg">
      <AppHeader />

      <main className="mx-auto w-[min(1216px,calc(100%-32px))] pt-6 pb-8 max-md:w-[min(100%,calc(100%-24px))] max-md:pt-4">
        <Outlet />
      </main>

      {shouldShowAiChatWidget && <WefinyChatWidget />}
    </div>
  )
}

export default AppLayout
