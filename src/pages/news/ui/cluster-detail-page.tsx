import GlobalChatRoom from '@/features/chat/ui/global-chat-room'
import ClusterDetailContent from '@/features/news-feed/ui/cluster-detail-content'

function ClusterDetailPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <ClusterDetailContent />

      <aside className="min-h-[640px]">
        <GlobalChatRoom />
      </aside>
    </div>
  )
}

export default ClusterDetailPage
