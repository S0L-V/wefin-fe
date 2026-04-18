import { useEffect, useState } from 'react'

import ChatPanel from '@/features/chat/ui/chat-panel'
import ClusterDetailContent from '@/features/news-feed/ui/cluster-detail-content'

function ReadingProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (progress === 0) return null

  return (
    <div className="fixed top-[48px] right-0 left-0 z-30 h-[3px] bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-wefin-mint-deep to-wefin-mint transition-[width] duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

function ClusterDetailPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <ReadingProgressBar />
      <ClusterDetailContent />

      <aside className="lg:sticky lg:top-[76px] lg:self-start">
        <div className="flex h-[640px] flex-col overflow-hidden rounded-2xl bg-white">
          <ChatPanel />
        </div>
      </aside>
    </div>
  )
}

export default ClusterDetailPage
