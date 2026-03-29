import { useMutation } from '@tanstack/react-query'

import { collectNews, crawlNews } from '../api/collect-news'

export function useCollectNews() {
  return useMutation({ mutationFn: collectNews })
}

export function useCrawlNews() {
  return useMutation({ mutationFn: crawlNews })
}
