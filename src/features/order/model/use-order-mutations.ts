import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invalidateTodayQuests } from '@/features/quest/model/use-today-quests'

import {
  buyOrder,
  type BuyOrderParams,
  cancelOrder,
  limitBuyOrder,
  type LimitBuyOrderParams,
  limitSellOrder,
  type LimitSellOrderParams,
  modifyOrder,
  type ModifyOrderParams,
  sellOrder,
  type SellOrderParams
} from '../api/mutate-order'

function invalidateOrderSideEffects(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['orders'] })
  queryClient.invalidateQueries({ queryKey: ['trades'] })
  queryClient.invalidateQueries({ queryKey: ['portfolio'] })
  queryClient.invalidateQueries({ queryKey: ['account'] })
  queryClient.invalidateQueries({ queryKey: ['ranking'] })
  void invalidateTodayQuests(queryClient)
}

export function useBuyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: BuyOrderParams) => buyOrder(params),
    onSuccess: () => invalidateOrderSideEffects(queryClient)
  })
}

export function useSellMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: SellOrderParams) => sellOrder(params),
    onSuccess: () => invalidateOrderSideEffects(queryClient)
  })
}

export function useLimitBuyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: LimitBuyOrderParams) => limitBuyOrder(params),
    onSuccess: () => invalidateOrderSideEffects(queryClient)
  })
}

export function useLimitSellMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: LimitSellOrderParams) => limitSellOrder(params),
    onSuccess: () => invalidateOrderSideEffects(queryClient)
  })
}

export function useModifyOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: ModifyOrderParams) => modifyOrder(params),
    onSuccess: () => invalidateOrderSideEffects(queryClient)
  })
}

export function useCancelOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderNo: string) => cancelOrder(orderNo),
    onSuccess: () => invalidateOrderSideEffects(queryClient)
  })
}
