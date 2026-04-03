import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const TEMP_USER_ID = '00000000-0000-4000-a000-000000000001'

const WS_URL = import.meta.env.VITE_WS_URL || '/ws'

export const stompClient = new Client({
  webSocketFactory: () => new SockJS(WS_URL),
  connectHeaders: {
    userId: TEMP_USER_ID
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
