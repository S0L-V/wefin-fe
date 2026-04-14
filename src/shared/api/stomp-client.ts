import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const WS_URL =
  import.meta.env.VITE_WS_URL ||
  (API_BASE_URL ? `${API_BASE_URL.replace(/\/+$/, '').replace(/\/api$/, '')}/ws` : '/ws')

// 연결 리스너 — onConnect를 여러 훅에서 경쟁하지 않도록 중앙 관리
const connectListeners = new Set<() => void>()

export const stompClient = new Client({
  webSocketFactory: () => new SockJS(WS_URL),
  beforeConnect: () => {
    const token = localStorage.getItem('accessToken')

    if (token) {
      stompClient.connectHeaders = { Authorization: `Bearer ${token}` }
      return
    }

    stompClient.connectHeaders = {}
  },
  reconnectDelay: 5000,
  onConnect: () => {
    connectListeners.forEach((fn) => fn())
  }
})

/**
 * STOMP 연결 시 호출될 리스너를 등록한다.
 * 이미 연결된 상태면 즉시 호출.
 * 반환값은 해제 함수.
 */
export function onStompConnect(fn: () => void): () => void {
  connectListeners.add(fn)
  if (stompClient.connected) fn()
  return () => {
    connectListeners.delete(fn)
  }
}

export function connectStomp() {
  if (!stompClient.active) {
    stompClient.activate()
  }
}

/* 앱 종료 시 1번 호출 */
export function disconnectStomp() {
  if (stompClient.active) {
    void stompClient.deactivate()
  }
}
