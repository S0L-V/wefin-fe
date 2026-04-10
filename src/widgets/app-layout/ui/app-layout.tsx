import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'

import { connectStomp, disconnectStomp } from '@/shared/api/stomp-client'
import AppHeader from '@/widgets/header/ui/app-header'

function AppLayout() {
  useEffect(() => {
    connectStomp()
    return () => disconnectStomp()
  }, [])

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
