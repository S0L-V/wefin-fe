import MarketTrendsSection from '@/features/market-trends/ui/market-trends-section'
import NewsFeedSection from '@/features/news-feed/ui/news-feed-section'
import NewsListSection from '@/features/news-feed/ui/news-list-section'
import HomeSidebar from '@/widgets/home-sidebar/ui/home-sidebar'

function HomePage() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="flex flex-col gap-4">
        <div className="rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <NewsFeedSection />
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <MarketTrendsSection />
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <NewsListSection />
        </div>
      </section>
      <aside className="lg:sticky lg:top-[76px] lg:self-start">
        <HomeSidebar />
      </aside>
    </div>
  )
}

export default HomePage
