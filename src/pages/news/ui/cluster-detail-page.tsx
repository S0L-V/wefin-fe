import WefinyChatWidget from '@/features/ai-chat/ui/wefini-chat-widget'
import GlobalChatRoom from '@/features/chat/ui/global-chat-room'
import ClusterDetailContent from '@/features/news-feed/ui/cluster-detail-content'

function ClusterDetailPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <ClusterDetailContent />

      <aside className="min-h-[640px] lg:sticky lg:top-[76px] lg:self-start">
        <GlobalChatRoom />
      </aside>

      <WefinyChatWidget />
    </div>
  )
}

export default ClusterDetailPage
