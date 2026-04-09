import GlobalChatRoom from '@/features/chat/ui/global-chat-room'
import NewsFeedSection from '@/features/news-feed/ui/news-feed-section'

function HomePage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-6">
        <NewsFeedSection />
      </div>

      <aside className="min-h-[640px]">
        <GlobalChatRoom />
      </aside>
    </div>
  )
}

export default HomePage
