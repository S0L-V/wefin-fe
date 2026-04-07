import StockSidebar from '@/widgets/stock-layout/ui/stock-sidebar'

export default function StockLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <main>{children}</main>
      <aside>
        <StockSidebar />
      </aside>
    </div>
  )
}
