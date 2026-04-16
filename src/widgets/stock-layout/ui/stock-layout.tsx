import { useCallback, useState } from 'react'

import ResizeHandle from '@/features/stock-detail/ui/resize-handle'
import StockSidebar from '@/widgets/stock-layout/ui/stock-sidebar'

interface StockLayoutProps {
  children: React.ReactNode
  sidebarWidth?: 'default' | 'narrow'
}

export default function StockLayout({ children, sidebarWidth = 'default' }: StockLayoutProps) {
  const defaultW = sidebarWidth === 'narrow' ? 270 : 380
  const [sideW, setSideW] = useState(defaultW)

  const handleResize = useCallback(
    (delta: number) => setSideW((w) => Math.max(280, Math.min(480, w - delta))),
    []
  )

  return (
    <div className="flex gap-0">
      <main className="min-w-0 flex-1">{children}</main>
      <ResizeHandle onResize={handleResize} />
      <aside className="shrink-0" style={{ width: sideW }}>
        <StockSidebar matchHeight />
      </aside>
    </div>
  )
}
