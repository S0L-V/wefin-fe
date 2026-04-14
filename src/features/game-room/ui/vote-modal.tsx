import '@/app/styles/dialog.css'

import * as Dialog from '@radix-ui/react-dialog'
import { Check, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { useVoteMutation } from '../model/use-vote-mutation'
import { useVoteStore } from '../model/use-vote-store'

interface VoteModalProps {
  roomId: string
}

function VoteModal({ roomId }: VoteModalProps) {
  const {
    isVoting,
    initiator,
    agreeCount,
    disagreeCount,
    totalCount,
    timeoutSeconds,
    result,
    hasVoted,
    markVoted,
    reset
  } = useVoteStore()

  const voteMutation = useVoteMutation(roomId)
  const [remaining, setRemaining] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 카운트다운 타이머
  useEffect(() => {
    if (!isVoting || result) return

    const startTime = Date.now()

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      setRemaining(Math.max(0, timeoutSeconds - elapsed))
    }

    // 첫 틱 즉시 실행 (콜백이므로 lint 통과)
    const initId = requestAnimationFrame(tick)

    timerRef.current = setInterval(tick, 1000)

    return () => {
      cancelAnimationFrame(initId)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isVoting, timeoutSeconds, result])

  // 결과 표시 후 2초 뒤 자동 닫기
  useEffect(() => {
    if (!result) return

    if (timerRef.current) clearInterval(timerRef.current)

    const timeout = setTimeout(() => {
      reset()
    }, 2000)

    return () => clearTimeout(timeout)
  }, [result, reset])

  function handleVote(agree: boolean) {
    markVoted()
    voteMutation.mutate(agree, {
      onError: () => {
        useVoteStore.setState({ hasVoted: false })
      }
    })
  }

  const open = isVoting || result !== null

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" style={{ zIndex: 50 }} />
        <Dialog.Content className="dialog-content" style={{ zIndex: 51 }}>
          <div className="flex flex-col items-center gap-4 py-2">
            {/* 제목 */}
            <Dialog.Title className="text-lg font-semibold text-wefin-text">
              {result ? '투표 결과' : '턴 전환 투표'}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-wefin-subtle">
              {result
                ? result === 'passed'
                  ? '다음 턴으로 이동합니다'
                  : '투표가 부결되었습니다'
                : `${initiator}님이 다음 턴 전환을 요청했습니다`}
            </Dialog.Description>

            {/* 결과 표시 */}
            {result ? (
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full ${
                  result === 'passed' ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                {result === 'passed' ? (
                  <Check className="h-8 w-8 text-green-500" />
                ) : (
                  <X className="h-8 w-8 text-red-500" />
                )}
              </div>
            ) : (
              <>
                {/* 카운트다운 */}
                <div className="text-3xl font-bold text-wefin-mint">{remaining}초</div>

                {/* 현황 바 */}
                <div className="flex w-full items-center justify-between rounded-xl bg-wefin-bg px-4 py-3 text-sm">
                  <span className="text-green-600">찬성 {agreeCount}</span>
                  <span className="text-wefin-subtle">/</span>
                  <span className="text-red-500">반대 {disagreeCount}</span>
                  <span className="text-wefin-subtle">/</span>
                  <span className="text-wefin-text">전체 {totalCount}</span>
                </div>

                {/* 투표 버튼 */}
                {!hasVoted ? (
                  <div className="flex w-full gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleVote(false)}
                      disabled={voteMutation.isPending}
                      className="flex-1 rounded-xl border border-red-200 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                    >
                      반대
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVote(true)}
                      disabled={voteMutation.isPending}
                      className="flex-1 rounded-xl bg-wefin-mint py-3 text-sm font-medium text-white transition-colors hover:bg-wefin-mint/90 disabled:opacity-50"
                    >
                      찬성
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-wefin-subtle">투표 완료 — 결과를 기다리는 중...</p>
                )}
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default VoteModal
