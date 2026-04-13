import { useEffect, useRef } from 'react'

import { useAuthUserId } from '@/features/auth/model/use-auth-user-id'

import { markClusterRead } from '../api/cluster-interaction'

/**
 * 상세 페이지 진입 시 클러스터를 읽음 처리한다.
 *
 * 로그인 상태이고 아직 읽지 않은 경우에만 1회 호출한다.
 * 서버는 비회원/중복 요청을 idempotent하게 처리하지만, 불필요한 네트워크를 피한다.
 */
export function useMarkClusterRead(clusterId: number, isRead: boolean | undefined) {
  const userId = useAuthUserId()
  const triggered = useRef<number | null>(null)

  useEffect(() => {
    if (!userId) return
    if (!clusterId || clusterId <= 0) return
    if (isRead !== false) return
    if (triggered.current === clusterId) return

    triggered.current = clusterId
    markClusterRead(clusterId).catch(() => {
      triggered.current = null
    })
  }, [clusterId, isRead, userId])
}
