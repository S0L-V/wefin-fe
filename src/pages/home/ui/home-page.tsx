import MarketTrendsSection from '@/features/market-trends/ui/market-trends-section'
import NewsFeedSection from '@/features/news-feed/ui/news-feed-section'
import NewsListSection from '@/features/news-feed/ui/news-list-section'
import HomeSidebar from '@/widgets/home-sidebar/ui/home-sidebar'

function HomePage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="flex flex-col gap-8 rounded-3xl border border-wefin-line bg-white p-6 shadow-sm">
        <NewsFeedSection />
        <MarketTrendsSection />
        <NewsListSection />
      </section>
      <aside className="lg:sticky lg:top-[76px] lg:self-start">
        <HomeSidebar />
      </aside>
    </div>
  )
}

export default HomePage
