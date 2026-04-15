import { useQuery } from '@tanstack/react-query'

import {
  type AssetHistoryParams,
  fetchAccount,
  fetchAssetHistory,
  fetchBuyingPower
} from '../api/fetch-account'

export function useAccountQuery() {
  return useQuery({
    queryKey: ['account', 'info'],
    queryFn: fetchAccount
  })
}

export function useBuyingPowerQuery(price: number) {
  return useQuery({
    queryKey: ['account', 'buying-power', price],
    queryFn: () => fetchBuyingPower(price),
    enabled: price > 0,
    staleTime: 5_000
  })
}

export function useAssetHistoryQuery(params: AssetHistoryParams = {}) {
  return useQuery({
    queryKey: ['account', 'asset-history', params],
    queryFn: () => fetchAssetHistory(params)
  })
}
