import { useMemo, useState } from 'react'

import { ApiError } from '@/shared/api/base-api'

import { useOrderMutation } from './use-order-mutation'
import { useSelectedStockStore } from './use-selected-stock-store'

export type OrderSide = 'buy' | 'sell'
export type OrderType = 'market' | 'limit'

interface UseOrderFormArgs {
  roomId: string
  cash: number
}

export function useOrderForm({ roomId, cash }: UseOrderFormArgs) {
  const [side, setSide] = useState<OrderSide>('buy')
  const [type, setType] = useState<OrderType>('market')
  const [quantity, setQuantity] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { selectedStock } = useSelectedStockStore()
  const currentPrice = selectedStock?.price ?? 0
  const orderMutation = useOrderMutation()

  const maxQuantity = useMemo(() => {
    if (!selectedStock || currentPrice <= 0) return 0
    return Math.floor(cash / currentPrice)
  }, [selectedStock, currentPrice, cash])

  const totalAmount = quantity * currentPrice

  function increment() {
    setQuantity((prev) => Math.min(prev + 1, maxQuantity))
  }

  function decrement() {
    setQuantity((prev) => Math.max(prev - 1, 0))
  }

  function setPercent(percent: number) {
    if (!selectedStock) return
    setQuantity(Math.floor(maxQuantity * (percent / 100)))
  }

  function setQuantityRaw(value: number) {
    if (Number.isNaN(value) || value < 0) {
      setQuantity(0)
      return
    }
    setQuantity(Math.min(Math.floor(value), maxQuantity))
  }

  function clearError() {
    setErrorMessage(null)
  }

  function submit() {
    if (!selectedStock || quantity <= 0) return
    if (orderMutation.isPending) return

    setErrorMessage(null)

    orderMutation.mutate(
      {
        roomId,
        symbol: selectedStock.symbol,
        orderType: side === 'buy' ? 'BUY' : 'SELL',
        quantity
      },
      {
        onSuccess: () => {
          setQuantity(0)
        },
        onError: (error) => {
          if (error instanceof ApiError) {
            setErrorMessage(error.message)
          } else {
            setErrorMessage('주문 처리 중 오류가 발생했습니다.')
          }
        }
      }
    )
  }

  return {
    side,
    type,
    quantity,
    currentPrice,
    maxQuantity,
    totalAmount,
    selectedStock,
    errorMessage,
    isSubmitting: orderMutation.isPending,
    setSide,
    setType,
    increment,
    decrement,
    setPercent,
    setQuantityRaw,
    submit,
    clearError
  }
}
