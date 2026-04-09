import { useMemo, useState } from 'react'

import { useSelectedStockStore } from './use-selected-stock-store'

export type OrderSide = 'buy' | 'sell'
export type OrderType = 'market' | 'limit'

interface UseOrderFormArgs {
  cash: number
}

export function useOrderForm({ cash }: UseOrderFormArgs) {
  const [side, setSide] = useState<OrderSide>('buy')
  const [type, setType] = useState<OrderType>('market')
  const [quantity, setQuantity] = useState(0)

  const { selectedStock } = useSelectedStockStore()
  const currentPrice = selectedStock?.price ?? 0

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

  return {
    side,
    type,
    quantity,
    currentPrice,
    maxQuantity,
    totalAmount,
    selectedStock,
    setSide,
    setType,
    increment,
    decrement,
    setPercent,
    setQuantityRaw
  }
}
