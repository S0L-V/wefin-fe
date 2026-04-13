import { Outlet } from 'react-router-dom'

import { useAuthUserId } from '@/features/auth/model/use-auth-user-id'
import { useGlobalChatBoot } from '@/features/chat/model/global/use-global-chat-boot'
import AppHeader from '@/widgets/header/ui/app-header'

function AppLayout() {
  const userId = useAuthUserId()

  useGlobalChatBoot(userId)

  return (
    <div className="min-h-screen bg-wefin-bg">
      <AppHeader />

      <main className="mx-auto w-[min(1400px,calc(100%-32px))] pt-2 pb-2 max-md:w-[min(100%,calc(100%-24px))] max-md:pt-2">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
