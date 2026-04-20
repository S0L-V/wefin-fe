import HeroSection from '@/features/market-trends/ui/hero-section'
import MarketTrendsSection from '@/features/market-trends/ui/market-trends-section'
import NewsFeedSection from '@/features/news-feed/ui/news-feed-section'
import NewsListSection from '@/features/news-feed/ui/news-list-section'
import RecommendedNewsSection from '@/features/recommended-news/ui/recommended-news-section'
import HomeSidebar from '@/widgets/home-sidebar/ui/home-sidebar'

function HomePage() {
  return (
    <div className="grid gap-[var(--gutter)] lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex flex-col gap-[var(--gutter)]">
        <HeroSection />
        <NewsFeedSection />
        <div className="card-base overflow-hidden">
          <MarketTrendsSection />
        </div>
        <RecommendedNewsSection />
        <div className="card-base p-[var(--card-pad)]">
          <NewsListSection />
        </div>
      </div>
      <aside className="lg:sticky lg:top-[80px] lg:self-start">
        <HomeSidebar />
      </aside>
    </div>
  )
}

export default HomePage
