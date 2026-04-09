import type { IFrame, StompSubscription } from '@stomp/stompjs'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import type { OrderbookData, PriceData } from '@/features/stock-detail/api/fetch-stock-detail'
import {
  orderbookMessageSchema,
  tradeMessageSchema
} from '@/features/stock-detail/api/stock-socket-messages'
import { stompClient } from '@/shared/api/stomp-client'

/**
 * /stocks/{code} 페이지가 마운트되면 해당 종목의 실시간 체결/호가를 구독하고,
 * 들어오는 WS 메시지를 React Query 캐시(['stocks', code, 'price' | 'orderbook'])에
 * 직접 push한다. 패널 컴포넌트들은 기존 useStockPriceQuery / useOrderbookQuery를
 * 그대로 사용하면 캐시 업데이트가 자동으로 리렌더에 반영된다.
 *
 * 분봉 캔들 토픽 구독은 별도 후속 작업에서 같은 훅에 추가 예정.
 */
export function useStockSocket(stockCode: string | undefined): void {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!stockCode) return

    const subscriptions: StompSubscription[] = []
    let prevOnConnect: typeof stompClient.onConnect | null = null
    let didSendSubscribe = false

    function setupSubscriptions() {
      // 1) 실시간 체결 → price 캐시 replace
      subscriptions.push(
        stompClient.subscribe(`/topic/stocks/${stockCode}`, (frame) => {
          try {
            const parsed = tradeMessageSchema.safeParse(JSON.parse(frame.body))
            if (!parsed.success) {
              console.warn('[useStockSocket] TRADE 파싱 실패:', parsed.error)
              return
            }
            const msg = parsed.data
            queryClient.setQueryData<PriceData>(['stocks', stockCode, 'price'], {
              stockCode: msg.stockCode,
              currentPrice: msg.currentPrice,
              changePrice: msg.changePrice,
              changeRate: msg.changeRate,
              volume: msg.totalVolume,
              openPrice: msg.openPrice,
              highPrice: msg.highPrice,
              lowPrice: msg.lowPrice
            })
          } catch (err) {
            console.warn('[useStockSocket] TRADE 처리 실패:', err)
          }
        })
      )

      // 2) 실시간 호가 → orderbook 캐시 replace
      subscriptions.push(
        stompClient.subscribe(`/topic/stocks/${stockCode}/orderbook`, (frame) => {
          try {
            const parsed = orderbookMessageSchema.safeParse(JSON.parse(frame.body))
            if (!parsed.success) {
              console.warn('[useStockSocket] ORDERBOOK 파싱 실패:', parsed.error)
              return
            }
            const msg = parsed.data
            queryClient.setQueryData<OrderbookData>(['stocks', stockCode, 'orderbook'], {
              asks: msg.asks,
              bids: msg.bids,
              totalAskQuantity: msg.totalAskQuantity,
              totalBidQuantity: msg.totalBidQuantity
            })
          } catch (err) {
            console.warn('[useStockSocket] ORDERBOOK 처리 실패:', err)
          }
        })
      )

      // 3) 서버에 종목 구독 요청 → BE가 한투 WS에 H0STCNT0/H0STASP0 등록을 트리거
      stompClient.publish({
        destination: '/app/stocks/subscribe',
        body: JSON.stringify({ stockCode })
      })
      didSendSubscribe = true
    }

    if (stompClient.connected) {
      setupSubscriptions()
    } else {
      // AppLayout의 useGlobalChatBoot가 connectStomp()를 이미 호출해두었지만,
      // 실제 STOMP CONNECTED 프레임 도착 전에 컴포넌트가 마운트될 수 있다.
      // game-room-socket과 동일한 onConnect 체이닝 패턴으로 연결 완료를 기다린다.
      prevOnConnect = stompClient.onConnect
      stompClient.onConnect = (frame: IFrame) => {
        prevOnConnect?.(frame)
        setupSubscriptions()
      }
    }

    return () => {
      // 종목 이동 시 BE에 먼저 unsubscribe SEND를 보내고 topic을 끊는다.
      // 아직 connect 전이라 setupSubscriptions가 호출되지 않았다면 publish는 스킵.
      if (didSendSubscribe && stompClient.connected) {
        stompClient.publish({
          destination: '/app/stocks/unsubscribe',
          body: JSON.stringify({ stockCode })
        })
      }
      subscriptions.forEach((sub) => sub.unsubscribe())
      if (prevOnConnect !== null) {
        stompClient.onConnect = prevOnConnect
      }
    }
  }, [stockCode, queryClient])
}
