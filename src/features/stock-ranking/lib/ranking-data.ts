import type { SegmentedTabItem } from '@/shared/ui/segmented-tabs'

export type RankingTab = 'volume' | 'amount' | 'rising' | 'falling'

export interface RankingStock {
  rank: number
  name: string
  code: string
  price: number
  changeRate: number
  volume: number
}

export const RANKING_TABS: SegmentedTabItem<RankingTab>[] = [
  { key: 'volume', label: '거래량 TOP' },
  { key: 'amount', label: '거래대금 TOP' },
  { key: 'rising', label: '급등' },
  { key: 'falling', label: '급락' }
]

// TODO: 거래 랭킹 API 연동 시 탭별 데이터 소스 분리 (limit=30)
export const MOCK_RANKING: RankingStock[] = [
  { rank: 1, name: '삼성전자', code: '005930', price: 97500, changeRate: 1.2, volume: 13168563 },
  { rank: 2, name: 'SK하이닉스', code: '000660', price: 285000, changeRate: -0.3, volume: 5672343 },
  { rank: 3, name: '카카오', code: '035720', price: 62300, changeRate: 3.5, volume: 4123406 },
  { rank: 4, name: 'NAVER', code: '035420', price: 185000, changeRate: 0.8, volume: 3238987 },
  { rank: 5, name: '현대차', code: '005380', price: 245000, changeRate: -2.1, volume: 2109836 },
  {
    rank: 6,
    name: 'LG에너지솔루션',
    code: '373220',
    price: 412000,
    changeRate: -1.5,
    volume: 1987654
  },
  { rank: 7, name: '삼성SDI', code: '006400', price: 399500, changeRate: -0.7, volume: 1876563 },
  { rank: 8, name: '셀트리온', code: '068270', price: 178000, changeRate: 1.5, volume: 1765432 },
  { rank: 9, name: '기아', code: '000270', price: 115000, changeRate: 0.5, volume: 1654323 },
  {
    rank: 10,
    name: 'POSCO홀딩스',
    code: '005490',
    price: 435000,
    changeRate: -1.2,
    volume: 1543218
  },
  {
    rank: 11,
    name: '삼성바이오로직스',
    code: '207940',
    price: 938000,
    changeRate: 0.4,
    volume: 1432187
  },
  { rank: 12, name: 'LG화학', code: '051910', price: 378500, changeRate: -0.9, volume: 1398764 },
  { rank: 13, name: '현대모비스', code: '012330', price: 243500, changeRate: 2.3, volume: 1298451 },
  { rank: 14, name: '삼성생명', code: '032830', price: 92400, changeRate: 1.1, volume: 1187432 },
  { rank: 15, name: 'KB금융', code: '105560', price: 78900, changeRate: -0.4, volume: 1098456 },
  { rank: 16, name: '신한지주', code: '055550', price: 56700, changeRate: 0.7, volume: 987654 },
  { rank: 17, name: '하나금융지주', code: '086790', price: 64800, changeRate: 1.3, volume: 876543 },
  { rank: 18, name: '카카오뱅크', code: '323410', price: 28500, changeRate: 4.2, volume: 843210 },
  {
    rank: 19,
    name: 'SK이노베이션',
    code: '096770',
    price: 142500,
    changeRate: -1.8,
    volume: 798765
  },
  { rank: 20, name: 'LG전자', code: '066570', price: 98700, changeRate: 0.3, volume: 754321 },
  { rank: 21, name: '크래프톤', code: '259960', price: 312000, changeRate: 2.8, volume: 698754 },
  { rank: 22, name: '엔씨소프트', code: '036570', price: 210500, changeRate: -0.6, volume: 654321 },
  { rank: 23, name: '넷마블', code: '251270', price: 68400, changeRate: 1.9, volume: 598765 },
  {
    rank: 24,
    name: '한화에어로스페이스',
    code: '012450',
    price: 289000,
    changeRate: 3.1,
    volume: 543210
  },
  { rank: 25, name: 'HMM', code: '011200', price: 23450, changeRate: -2.5, volume: 498765 },
  {
    rank: 26,
    name: '두산에너빌리티',
    code: '034020',
    price: 42800,
    changeRate: 5.4,
    volume: 465432
  },
  { rank: 27, name: 'KT&G', code: '033780', price: 108000, changeRate: 0.2, volume: 432198 },
  {
    rank: 28,
    name: '아모레퍼시픽',
    code: '090430',
    price: 147500,
    changeRate: -1.1,
    volume: 398765
  },
  { rank: 29, name: 'SK텔레콤', code: '017670', price: 54200, changeRate: 0.6, volume: 376543 },
  { rank: 30, name: 'KT', code: '030200', price: 43800, changeRate: -0.3, volume: 354321 }
]
