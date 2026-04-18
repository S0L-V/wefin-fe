import { toast } from 'sonner'

import { useShareClusterNews } from './use-share-cluster-news'

export function useShareClusterNewsAction(clusterId: number) {
  const shareClusterNews = useShareClusterNews({
    onSuccess: () => {
      toast.success('채팅방에 공유했어요')
    },
    onError: (error) => {
      console.error('Failed to share cluster news:', error)
      toast.error('뉴스 공유에 실패했어요')
    }
  })

  function handleShareNews() {
    if (shareClusterNews.isPending) return
    shareClusterNews.mutate(clusterId)
  }

  return {
    handleShareNews,
    isPending: shareClusterNews.isPending
  }
}
