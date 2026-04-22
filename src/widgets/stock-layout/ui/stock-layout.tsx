import { useCallback, useState } from 'react'

import ResizeHandle from '@/features/stock-detail/ui/resize-handle'
import StockSidebar from '@/widgets/stock-layout/ui/stock-sidebar'

interface StockLayoutProps {
  children: React.ReactNode
  sidebarWidth?: 'default' | 'narrow'
}

export default function StockLayout({ children, sidebarWidth = 'default' }: StockLayoutProps) {
  const [sideW, setSideW] = useState(() => {
    const ratio = sidebarWidth === 'narrow' ? 0.18 : 0.22
    const w = typeof window !== 'undefined' ? Math.round(window.innerWidth * ratio) : 320
    return Math.max(240, Math.min(440, w))
  })

  const handleResize = useCallback(
    (delta: number) => setSideW((w) => Math.max(240, Math.min(440, w - delta))),
    []
  )

  return (
    <div className="flex gap-0">
      <main className="min-w-0 flex-1">{children}</main>
      <div className="hidden xl:flex">
        <ResizeHandle onResize={handleResize} />
      </div>
      <aside className="hidden shrink-0 overflow-hidden xl:block" style={{ width: sideW }}>
        <StockSidebar />
      </aside>
    </div>
  )
}
