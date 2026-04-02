import { Outlet } from 'react-router-dom'

import { useDemoUserId } from '@/features/chat/model/use-demo-user-id'
import { useGlobalChatBoot } from '@/features/chat/model/use-global-chat-boot'
import AppHeader from '@/widgets/header/ui/app-header'

function AppLayout() {
  const userId = useDemoUserId()

  // AppLayout is a stable parent route, so it is the best place to keep one
  // shared global-chat connection alive while child pages change underneath it.
  useGlobalChatBoot(userId)

  return (
    <div className="min-h-screen bg-wefin-bg">
      <AppHeader />

      <main className="mx-auto w-[min(1216px,calc(100%-32px))] pt-6 pb-8 max-md:w-[min(100%,calc(100%-24px))] max-md:pt-4">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
