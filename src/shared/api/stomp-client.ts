import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const WS_URL = import.meta.env.VITE_WS_URL || (API_BASE_URL ? `${API_BASE_URL}/ws` : '/ws')

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
  reconnectDelay: 5000
})

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
