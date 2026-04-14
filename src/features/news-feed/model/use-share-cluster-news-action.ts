import { useNavigate } from 'react-router-dom'

import { useShareClusterNews } from './use-share-cluster-news'

export function useShareClusterNewsAction(clusterId: number) {
  const navigate = useNavigate()
  const shareClusterNews = useShareClusterNews({
    onSuccess: () => {
      navigate('/chat')
    },
    onError: (error) => {
      console.error('Failed to share cluster news:', error)
      window.alert('뉴스 공유에 실패했어요. 잠시 후 다시 시도해주세요.')
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
