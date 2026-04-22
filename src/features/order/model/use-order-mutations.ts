import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

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
  type OrderResponse,
  sellOrder,
  type SellOrderParams
} from '../api/mutate-order'
import { shareProfitToChat } from '../api/share-profit'

const PROFIT_SHARE_THRESHOLD = 500_000

function tryShareProfit(data: OrderResponse) {
  if (
    data.realizedProfit != null &&
    Math.abs(data.realizedProfit) >= PROFIT_SHARE_THRESHOLD &&
    data.stockName
  ) {
    const nickname = localStorage.getItem('nickname') ?? '익명'

    shareProfitToChat({
      stockName: data.stockName,
      profitAmount: data.realizedProfit,
      userNickname: nickname
    }).catch(() => {})
  }
}

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
    onSuccess: (_data, params) => {
      invalidateOrderSideEffects(queryClient)
      toast(`${params.quantity}주 매수 체결`, {
        style: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }
      })
    },
    onError: () => toast.error('매수 주문에 실패했어요')
  })
}

export function useSellMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: SellOrderParams) => sellOrder(params),
    onSuccess: (data, params) => {
      invalidateOrderSideEffects(queryClient)
      tryShareProfit(data)
      toast(`${params.quantity}주 매도 체결`, {
        style: { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }
      })
    },
    onError: () => toast.error('매도 주문에 실패했어요')
  })
}

export function useLimitBuyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: LimitBuyOrderParams) => limitBuyOrder(params),
    onSuccess: (_data, params) => {
      invalidateOrderSideEffects(queryClient)
      toast(`${params.quantity}주 ${params.requestPrice.toLocaleString()}원 매수`, {
        style: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }
      })
    },
    onError: () => toast.error('매수 주문에 실패했어요')
  })
}

export function useLimitSellMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: LimitSellOrderParams) => limitSellOrder(params),
    onSuccess: (data, params) => {
      invalidateOrderSideEffects(queryClient)
      tryShareProfit(data)
      toast(`${params.quantity}주 ${params.requestPrice.toLocaleString()}원 매도`, {
        style: { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }
      })
    },
    onError: () => toast.error('매도 주문에 실패했어요')
  })
}

export function useModifyOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: ModifyOrderParams) => modifyOrder(params),
    onSuccess: (_data, params) => {
      invalidateOrderSideEffects(queryClient)
      toast(`${params.quantity}주 ${params.requestPrice.toLocaleString()}원으로 정정 완료`, {
        style: { background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' }
      })
    },
    onError: () => toast.error('주문 정정에 실패했어요')
  })
}

export function useCancelOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderNo: string) => cancelOrder(orderNo),
    onSuccess: () => {
      invalidateOrderSideEffects(queryClient)
      toast('주문이 취소되었어요', {
        style: { background: '#f9fafb', color: '#6b7280', border: '1px solid #e5e7eb' }
      })
    },
    onError: () => toast.error('주문 취소에 실패했어요')
  })
}
