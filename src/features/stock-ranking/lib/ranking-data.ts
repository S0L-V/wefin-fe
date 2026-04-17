import type { SegmentedTabItem } from '@/shared/ui/segmented-tabs'

export type RankingTab = 'volume' | 'amount' | 'rising' | 'falling'

export const RANKING_TABS: SegmentedTabItem<RankingTab>[] = [
  { key: 'amount', label: '거래대금 TOP' },
  { key: 'volume', label: '거래량 TOP' },
  { key: 'rising', label: '급등' },
  { key: 'falling', label: '급락' }
]
