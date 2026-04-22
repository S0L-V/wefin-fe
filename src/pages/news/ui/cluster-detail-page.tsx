import { useEffect, useState } from 'react'

import ChatPanel from '@/features/chat/ui/chat-panel'
import ClusterDetailContent from '@/features/news-feed/ui/cluster-detail-content'

function ReadingProgressBar() {
  const [progress, setProgress] = useState(() => {
    const h = document.documentElement.scrollHeight - window.innerHeight
    return h > 0 ? Math.min((window.scrollY / h) * 100, 100) : 0
  })

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
        className="h-full bg-gradient-to-r from-wefin-mint-deep to-wefin-mint"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

function ClusterDetailPage() {
  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,30%)]">
      <ReadingProgressBar />
      <ClusterDetailContent />

      <aside className="hidden xl:sticky xl:top-[76px] xl:block xl:self-start">
        <div className="card-base flex h-[calc(100dvh-120px)] min-h-[280px] flex-col overflow-hidden">
          <ChatPanel />
        </div>
      </aside>
    </div>
  )
}

export default ClusterDetailPage
