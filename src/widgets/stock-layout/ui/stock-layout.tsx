import { useCallback, useState } from 'react'

import ResizeHandle from '@/features/stock-detail/ui/resize-handle'
import StockSidebar from '@/widgets/stock-layout/ui/stock-sidebar'

interface StockLayoutProps {
  children: React.ReactNode
  sidebarWidth?: 'default' | 'narrow'
}

export default function StockLayout({ children, sidebarWidth = 'default' }: StockLayoutProps) {
  const defaultW = sidebarWidth === 'narrow' ? 320 : 420
  const [sideW, setSideW] = useState(defaultW)

  const handleResize = useCallback(
    (delta: number) => setSideW((w) => Math.max(320, Math.min(520, w - delta))),
    []
  )

  return (
    <div className="flex gap-0">
      <main className="min-w-0 flex-1">{children}</main>
      <div className="hidden lg:flex">
        <ResizeHandle onResize={handleResize} />
      </div>
      <aside className="hidden shrink-0 lg:block" style={{ width: sideW }}>
        <StockSidebar matchHeight />
      </aside>
    </div>
  )
}
