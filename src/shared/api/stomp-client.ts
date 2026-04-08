import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const WS_URL = import.meta.env.VITE_WS_URL || '/ws'

export const stompClient = new Client({
  webSocketFactory: () => new SockJS(WS_URL),
  beforeConnect: () => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      stompClient.connectHeaders = { Authorization: `Bearer ${token}` }
    }
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
