import { ArrowLeft, Check, Copy, Info, LogIn, LogOut, Plus, Users } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { ApiError } from '@/shared/api/base-api'
import ConfirmDialog from '@/shared/ui/confirm-dialog'

import { useCreateGroupInviteCodeMutation } from '../model/use-create-group-invite-code-mutation'
import { useCreateGroupMutation } from '../model/use-create-group-mutation'
import { useGroupInviteCodeQuery } from '../model/use-group-invite-code-query'
import { useJoinGroupMutation } from '../model/use-join-group-mutation'
import { useLeaveGroupMutation } from '../model/use-leave-group-mutation'
import { useMyGroupQuery } from '../model/use-my-group-query'

type SettingsGroupSectionProps = {
  isLoggedIn: boolean
}

function getInviteStatusDisplay(status: string): { label: string; className: string } {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return { label: '사용 가능', className: 'text-wefin-mint bg-wefin-mint-soft' }
    case 'EXPIRED':
      return { label: '만료됨', className: 'text-wefin-subtle bg-gray-100' }
    default:
      return { label: status, className: 'text-wefin-subtle bg-gray-100' }
  }
}

function SettingsGroupSection({ isLoggedIn }: SettingsGroupSectionProps) {
  const {
    data: group,
    isLoading,
    isError,
    error
  } = useMyGroupQuery({
    enabled: isLoggedIn
  })

  type HomeGroupMode = 'idle' | 'create' | 'join'

  const [inviteCodeInput, setInviteCodeInput] = useState('')
  const [newGroupName, setNewGroupName] = useState('')
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const [homeGroupMode, setHomeGroupMode] = useState<HomeGroupMode>('idle')
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const copyTimeoutRef = useRef<number | null>(null)

  const isHomeGroup = group?.isHomeGroup ?? true

  const leaveGroupMutation = useLeaveGroupMutation()
  const createInviteMutation = useCreateGroupInviteCodeMutation()
  const joinGroupMutation = useJoinGroupMutation(() => {
    setInviteCodeInput('')
  })
  const createGroupMutation = useCreateGroupMutation(() => {
    setNewGroupName('')
  })

  const inviteCodeQuery = useGroupInviteCodeQuery({
    groupId: group?.groupId,
    enabled: isLoggedIn && !isHomeGroup && !isLoading && !isError
  })

  const currentInviteCodeData = inviteCodeQuery.data ?? createInviteMutation.data ?? null
  const inviteCode = currentInviteCodeData?.inviteCode ?? ''
  const inviteStatus = currentInviteCodeData?.status ?? null
  const inviteExpiredAt = currentInviteCodeData?.expiredAt ?? null
  const hasInviteCode = !!inviteCode
  const isCodeExpired = inviteStatus === 'EXPIRED'

  const inviteExpiredAtText = inviteExpiredAt
    ? new Date(inviteExpiredAt).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null

  const canLeaveGroup = isLoggedIn && !isLoading && !isError && !!group && !isHomeGroup
  const canCreateInvite = isLoggedIn && !isLoading && !isError && !!group && !isHomeGroup
  const canJoinGroup =
    isLoggedIn && !joinGroupMutation.isPending && inviteCodeInput.trim().length > 0
  const canCreateGroup =
    isLoggedIn &&
    !createGroupMutation.isPending &&
    !isLoading &&
    !isError &&
    isHomeGroup &&
    newGroupName.trim().length > 0

  const isLeaving = leaveGroupMutation.isPending
  const isCreatingInvite = createInviteMutation.isPending
  const isJoiningGroup = joinGroupMutation.isPending
  const isCreatingGroup = createGroupMutation.isPending

  const groupName = !isLoggedIn
    ? '로그인 후 확인 가능'
    : isLoading
      ? '불러오는 중...'
      : isError
        ? '그룹 정보를 불러오지 못했어요'
        : (group?.groupName ?? '그룹 정보를 찾을 수 없어요')

  const queryErrorMessage =
    isError && error instanceof ApiError
      ? error.message
      : '그룹 정보를 불러오는 중 오류가 발생했어요.'

  const inviteErrorMessage =
    createInviteMutation.isError && createInviteMutation.error instanceof ApiError
      ? createInviteMutation.error.message
      : '초대 코드 생성 중 오류가 발생했어요.'

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  // 새 액션 시작 시 다른 mutation의 success/error 플래그 함께 reset
  // → "그룹 생성 성공" 메시지가 이후 "탈퇴 성공" 메시지와 동시에 뜨는 누적 문제 방지
  const resetOtherMutations = (keep: 'leave' | 'invite' | 'join' | 'create' | 'none' = 'none') => {
    if (keep !== 'leave') leaveGroupMutation.reset()
    if (keep !== 'invite') createInviteMutation.reset()
    if (keep !== 'join') joinGroupMutation.reset()
    if (keep !== 'create') createGroupMutation.reset()
  }

  const handleLeaveGroup = () => {
    if (!group || !canLeaveGroup || isLeaving) return
    setShowLeaveConfirm(true)
  }

  const confirmLeaveGroup = () => {
    setShowLeaveConfirm(false)
    if (!group) return
    resetOtherMutations('leave')
    setCopyState('idle')
    leaveGroupMutation.mutate(group.groupId, {
      onSuccess: () => toast.success('그룹에서 탈퇴했어요'),
      onError: (error) =>
        toast.error(error instanceof ApiError ? error.message : '그룹 탈퇴 중 오류가 발생했어요')
    })
  }

  const handleCreateInvite = () => {
    if (!group || !canCreateInvite || isCreatingInvite) {
      return
    }

    resetOtherMutations('invite')
    setCopyState('idle')

    createInviteMutation.mutate(group.groupId, {
      onSuccess: () => {
        void inviteCodeQuery.refetch()
      }
    })
  }

  const handleJoinGroup = () => {
    const trimmedInviteCode = inviteCodeInput.trim()

    if (!canJoinGroup || !trimmedInviteCode) {
      return
    }

    resetOtherMutations('join')
    setCopyState('idle')
    joinGroupMutation.mutate(
      { inviteCode: trimmedInviteCode },
      {
        onSuccess: () => {
          setHomeGroupMode('idle')
          toast.success('그룹에 참여했어요')
        },
        onError: (error) =>
          toast.error(error instanceof ApiError ? error.message : '그룹 참여 중 오류가 발생했어요')
      }
    )
  }

  const handleCreateGroup = () => {
    const trimmedGroupName = newGroupName.trim()

    if (!canCreateGroup || !trimmedGroupName) {
      return
    }

    resetOtherMutations('create')
    setCopyState('idle')
    createGroupMutation.mutate(
      { name: trimmedGroupName },
      {
        onSuccess: () => {
          setHomeGroupMode('idle')
          toast.success('새 그룹이 생성되었어요')
        },
        onError: (error) =>
          toast.error(
            error instanceof ApiError ? error.message : '새 그룹 생성 중 오류가 발생했어요'
          )
      }
    )
  }

  const handleBackToIdle = () => {
    setHomeGroupMode('idle')
    setInviteCodeInput('')
    setNewGroupName('')
    joinGroupMutation.reset()
    createGroupMutation.reset()
  }

  const handleCopy = async (text: string) => {
    if (!text || !hasInviteCode || isCodeExpired) {
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }

    if (copyTimeoutRef.current) {
      window.clearTimeout(copyTimeoutRef.current)
    }

    copyTimeoutRef.current = window.setTimeout(() => {
      setCopyState('idle')
      copyTimeoutRef.current = null
    }, 1500)
  }

  const statusDisplay = inviteStatus ? getInviteStatusDisplay(inviteStatus) : null

  return (
    <div className="max-w-md divide-y divide-wefin-line/70">
      {/* 비로그인 / 로딩 / 에러 상태 — 어떤 화면을 그릴지 결정되기 전 단계 */}
      {!isLoggedIn ? (
        <div className="px-4 py-6 text-center text-sm text-wefin-subtle">
          로그인 후 그룹을 사용할 수 있어요.
        </div>
      ) : isLoading ? (
        <div className="px-4 py-6 text-center text-sm text-wefin-subtle">불러오는 중...</div>
      ) : isError ? (
        <div className="px-4 py-6 text-center text-sm text-red-500">{queryErrorMessage}</div>
      ) : null}

      {/* 공유 그룹 멤버일 때만: 그룹 정보 + 탈퇴 */}
      {isLoggedIn && !isLoading && !isError && !isHomeGroup && (
        <div className="px-4 py-3.5">
          <div className="flex max-w-md items-start justify-between gap-4 max-md:flex-col">
            <div>
              <p className="text-xs text-wefin-subtle">현재 소속 그룹</p>
              <p className="mt-0.5 text-base font-bold text-wefin-text">{groupName}</p>
            </div>

            <button
              type="button"
              onClick={handleLeaveGroup}
              disabled={!canLeaveGroup || isLeaving}
              className={[
                'inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors',
                canLeaveGroup && !isLeaving
                  ? 'border-red-200 text-red-500 hover:bg-red-50'
                  : 'border-wefin-line text-red-500 opacity-50'
              ].join(' ')}
            >
              <LogOut size={16} />
              {isLeaving ? '탈퇴 중...' : '그룹 탈퇴'}
            </button>
          </div>
        </div>
      )}

      {!isHomeGroup && isLoggedIn && (
        <div className="px-4 py-3.5">
          <div className="mb-2 flex items-center gap-1.5">
            <label htmlFor="invite-code-input" className="text-sm font-semibold text-wefin-text">
              초대 코드
            </label>
            <span className="group relative inline-flex h-4 w-4 items-center justify-center text-wefin-subtle">
              <Info size={13} />
              <span className="pointer-events-none invisible absolute left-1/2 top-full z-20 mt-1.5 w-[260px] -translate-x-1/2 rounded-lg bg-wefin-text px-3 py-2.5 text-xs leading-relaxed font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
                초대 코드는 24시간 동안 사용할 수 있어요. 만료되기 전까지 같은 코드를 다시 사용할 수
                있어요.
              </span>
            </span>

            {statusDisplay ? (
              <span
                className={[
                  'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  statusDisplay.className
                ].join(' ')}
              >
                {statusDisplay.label}
              </span>
            ) : null}
          </div>

          <div className="flex max-w-md gap-2">
            <input
              id="invite-code-input"
              type="text"
              readOnly
              value={
                hasInviteCode
                  ? inviteCode
                  : inviteCodeQuery.isLoading
                    ? '확인 중...'
                    : '발급된 코드가 없어요'
              }
              className="h-11 flex-1 rounded-xl border border-wefin-line bg-wefin-bg px-4 text-sm text-wefin-subtle outline-none"
            />
            {hasInviteCode && !isCodeExpired ? (
              <button
                type="button"
                onClick={() => handleCopy(inviteCode)}
                className={[
                  'inline-flex h-11 w-[96px] shrink-0 items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold transition-all duration-200',
                  copyState === 'copied'
                    ? 'border-wefin-mint bg-wefin-mint text-white'
                    : copyState === 'failed'
                      ? 'border-red-300 bg-red-50 text-red-600'
                      : 'border-wefin-line text-wefin-text hover:bg-wefin-mint-soft/60'
                ].join(' ')}
              >
                {copyState === 'copied' ? (
                  <>
                    <Check size={16} />
                    복사됨
                  </>
                ) : copyState === 'failed' ? (
                  '실패'
                ) : (
                  <>
                    <Copy size={16} />
                    복사
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreateInvite}
                disabled={!canCreateInvite || isCreatingInvite}
                className={[
                  'inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-bold text-white transition-colors',
                  canCreateInvite && !isCreatingInvite
                    ? 'bg-wefin-mint hover:bg-wefin-mint-deep'
                    : 'bg-wefin-mint/40 cursor-not-allowed'
                ].join(' ')}
              >
                <Plus size={16} />
                {isCreatingInvite ? '발급 중...' : isCodeExpired ? '재발급' : '코드 발급'}
              </button>
            )}
          </div>
          {hasInviteCode && inviteExpiredAtText && !isCodeExpired && (
            <p className="mt-2 text-xs text-wefin-subtle">
              {inviteExpiredAtText}까지 사용할 수 있어요.
            </p>
          )}
          {isCodeExpired && (
            <p className="mt-2 text-xs text-orange-600">
              초대 코드가 만료되었어요. 새 코드를 발급해주세요.
            </p>
          )}
          {createInviteMutation.isError && (
            <p className="mt-2 text-xs text-red-500">{inviteErrorMessage}</p>
          )}
        </div>
      )}

      {isHomeGroup && isLoggedIn && !isLoading && !isError && (
        <div className="px-4 py-5">
          {homeGroupMode === 'idle' && (
            <div className="rounded-2xl border border-wefin-line bg-wefin-bg/60 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-wefin-mint-soft text-wefin-mint-deep">
                <Users size={22} />
              </div>
              <h3 className="mt-3 text-base font-bold text-wefin-text">아직 소속 그룹이 없어요</h3>
              <p className="mt-1 text-sm leading-6 text-wefin-subtle">
                그룹에 참여하면 멤버들과 함께 투자 활동을 공유할 수 있어요.
              </p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => setHomeGroupMode('create')}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-wefin-mint px-5 text-sm font-semibold text-white transition-colors hover:bg-[#2a8282]"
                >
                  <Plus size={16} />새 그룹 만들기
                </button>
                <button
                  type="button"
                  onClick={() => setHomeGroupMode('join')}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-wefin-line bg-white px-5 text-sm font-semibold text-wefin-text transition-colors hover:bg-wefin-bg"
                >
                  <LogIn size={16} />
                  초대 코드로 참여
                </button>
              </div>
            </div>
          )}

          {homeGroupMode === 'create' && (
            <div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBackToIdle}
                  className="-ml-1 inline-flex h-8 w-8 items-center justify-center rounded-lg text-wefin-subtle transition-colors hover:bg-wefin-bg hover:text-wefin-text"
                  aria-label="돌아가기"
                >
                  <ArrowLeft size={18} />
                </button>
                <h3 className="text-lg font-bold text-wefin-text">어떤 그룹을 만들까요?</h3>
              </div>
              <p className="mt-1 text-sm text-wefin-subtle">
                생성 후 초대 코드로 멤버를 초대할 수 있어요.
              </p>
              <div className="mt-5 flex max-w-md gap-2 max-md:flex-col">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => {
                    // 한글 IME 조합 중 Enter는 무시 (마지막 글자 확정용)
                    if (e.nativeEvent.isComposing) return
                    if (e.key === 'Enter' && canCreateGroup) handleCreateGroup()
                  }}
                  disabled={isCreatingGroup}
                  autoFocus
                  placeholder="그룹 이름"
                  className="h-12 flex-1 rounded-xl border-[1.5px] border-wefin-line bg-white px-4 text-sm text-wefin-text outline-none transition-colors placeholder:text-wefin-subtle focus:border-wefin-mint disabled:bg-wefin-bg"
                />
                <button
                  type="button"
                  onClick={handleCreateGroup}
                  disabled={!canCreateGroup}
                  className={[
                    'inline-flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl px-5 text-sm font-bold text-white transition-colors',
                    canCreateGroup
                      ? 'bg-wefin-mint hover:bg-wefin-mint-deep'
                      : 'bg-wefin-mint/40 cursor-not-allowed'
                  ].join(' ')}
                >
                  {isCreatingGroup ? '생성 중...' : '만들기'}
                </button>
              </div>
            </div>
          )}

          {homeGroupMode === 'join' && (
            <div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBackToIdle}
                  className="-ml-1 inline-flex h-8 w-8 items-center justify-center rounded-lg text-wefin-subtle transition-colors hover:bg-wefin-bg hover:text-wefin-text"
                  aria-label="돌아가기"
                >
                  <ArrowLeft size={18} />
                </button>
                <h3 className="text-lg font-bold text-wefin-text">초대 코드를 입력해주세요</h3>
              </div>
              <p className="mt-1 text-sm text-wefin-subtle">
                받은 코드를 입력하면 즉시 그룹에 참여해요.
              </p>
              <div className="mt-5 flex max-w-md gap-2 max-md:flex-col">
                <input
                  type="text"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value)}
                  onKeyDown={(e) => {
                    // 한글 IME 조합 중 Enter는 무시
                    if (e.nativeEvent.isComposing) return
                    if (e.key === 'Enter' && canJoinGroup) handleJoinGroup()
                  }}
                  disabled={isJoiningGroup}
                  autoFocus
                  placeholder="초대 코드"
                  className="h-12 flex-1 rounded-xl border-[1.5px] border-wefin-line bg-white px-4 text-sm tracking-wider tabular-nums text-wefin-text outline-none transition-colors placeholder:tracking-normal placeholder:text-wefin-subtle focus:border-wefin-mint disabled:bg-wefin-bg"
                />
                <button
                  type="button"
                  onClick={handleJoinGroup}
                  disabled={!canJoinGroup}
                  className={[
                    'inline-flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl px-5 text-sm font-bold text-white transition-colors',
                    canJoinGroup
                      ? 'bg-wefin-mint hover:bg-wefin-mint-deep'
                      : 'bg-wefin-mint/40 cursor-not-allowed'
                  ].join(' ')}
                >
                  {isJoiningGroup ? '참여 중...' : '참여하기'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      <ConfirmDialog
        open={showLeaveConfirm}
        onConfirm={confirmLeaveGroup}
        onCancel={() => setShowLeaveConfirm(false)}
        title="그룹에서 탈퇴하시겠어요?"
        description="탈퇴하면 그룹 채팅과 활동 내역을 볼 수 없어요"
        confirmLabel="탈퇴"
        cancelLabel="취소"
        confirmVariant="danger"
        icon={<LogOut size={22} className="text-rose-500" />}
      />
    </div>
  )
}

export default SettingsGroupSection
