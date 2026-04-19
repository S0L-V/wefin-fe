import { useQuery } from '@tanstack/react-query'

import {
  fetchKeywords,
  fetchSectors,
  fetchStocksByKeyword,
  searchStocks
} from '../api/fetch-stocks'

export function useStockSearch(roomId: string, keyword: string) {
  return useQuery({
    queryKey: ['stockSearch', roomId, keyword],
    queryFn: () => searchStocks(roomId, keyword),
    enabled: keyword.length >= 1,
    select: (response) => response.data,
    staleTime: 30_000
  })
}

export function useSectors(roomId: string) {
  return useQuery({
    queryKey: ['sectors', roomId],
    queryFn: () => fetchSectors(roomId),
    select: (response) => response.data,
    staleTime: 5 * 60_000 // 섹터 목록은 거의 안 바뀌므로 5분
  })
}

export function useSectorKeywords(roomId: string, sector: string | null) {
  return useQuery({
    queryKey: ['sectorKeywords', roomId, sector],
    queryFn: () => fetchKeywords(roomId, sector!),
    enabled: !!sector,
    select: (response) => response.data,
    staleTime: 5 * 60_000
  })
}

export function useSectorStocks(roomId: string, sector: string | null, keyword: string | null) {
  return useQuery({
    queryKey: ['sectorStocks', roomId, sector, keyword],
    queryFn: () => fetchStocksByKeyword(roomId, sector!, keyword!),
    enabled: !!sector && !!keyword,
    select: (response) => response.data,
    staleTime: 30_000
  })
}
