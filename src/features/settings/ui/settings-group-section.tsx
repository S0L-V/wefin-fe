import { Copy, LogOut, Plus, RefreshCw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { ApiError } from '@/shared/api/base-api'

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
    case 'ACTIVE':
      return { label: '사용 가능', className: 'text-wefin-mint bg-wefin-mint-soft' }
    case 'PENDING':
      return { label: '사용 가능', className: 'text-wefin-mint bg-wefin-mint-soft' }
    case 'USED':
      return { label: '사용됨', className: 'text-orange-600 bg-orange-50' }
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

  const [inviteCodeInput, setInviteCodeInput] = useState('')
  const [newGroupName, setNewGroupName] = useState('')
  const [copyMessage, setCopyMessage] = useState('')
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
  const hasInviteCode = !!inviteCode
  const isCodeConsumed = inviteStatus === 'USED' || inviteStatus === 'EXPIRED'

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

  const leaveErrorMessage =
    leaveGroupMutation.isError && leaveGroupMutation.error instanceof ApiError
      ? leaveGroupMutation.error.message
      : '그룹 탈퇴 중 오류가 발생했어요.'

  const inviteErrorMessage =
    createInviteMutation.isError && createInviteMutation.error instanceof ApiError
      ? createInviteMutation.error.message
      : '초대 코드 생성 중 오류가 발생했어요.'

  const joinErrorMessage =
    joinGroupMutation.isError && joinGroupMutation.error instanceof ApiError
      ? joinGroupMutation.error.message
      : '그룹 참여 중 오류가 발생했어요.'

  const createGroupErrorMessage =
    createGroupMutation.isError && createGroupMutation.error instanceof ApiError
      ? createGroupMutation.error.message
      : '새 그룹 생성 중 오류가 발생했어요.'

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  const handleLeaveGroup = () => {
    if (!group || !canLeaveGroup || isLeaving) {
      return
    }

    const confirmed = window.confirm('정말로 현재 그룹에서 탈퇴하시겠어요?')
    if (!confirmed) {
      return
    }

    leaveGroupMutation.mutate(group.groupId, {
      onSuccess: () => {
        createInviteMutation.reset()
        setCopyMessage('')
      }
    })
  }

  const handleCreateInvite = () => {
    if (!group || !canCreateInvite || isCreatingInvite) {
      return
    }

    createInviteMutation.reset()
    setCopyMessage('')

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

    joinGroupMutation.mutate(
      {
        inviteCode: trimmedInviteCode
      },
      {
        onSuccess: () => {
          createInviteMutation.reset()
          setCopyMessage('')
        }
      }
    )
  }

  const handleCreateGroup = () => {
    const trimmedGroupName = newGroupName.trim()

    if (!canCreateGroup || !trimmedGroupName) {
      return
    }

    createGroupMutation.mutate(
      {
        name: trimmedGroupName
      },
      {
        onSuccess: () => {
          createInviteMutation.reset()
          setCopyMessage('')
        }
      }
    )
  }

  const handleCopy = async (text: string, label: string) => {
    if (!text || !hasInviteCode || isCodeConsumed) {
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      setCopyMessage(`${label}가 복사되었습니다.`)
    } catch {
      setCopyMessage('복사에 실패했어요. 직접 선택해서 복사해주세요.')
    }

    if (copyTimeoutRef.current) {
      window.clearTimeout(copyTimeoutRef.current)
    }

    copyTimeoutRef.current = window.setTimeout(() => {
      setCopyMessage('')
      copyTimeoutRef.current = null
    }, 2000)
  }

  const statusDisplay = inviteStatus ? getInviteStatusDisplay(inviteStatus) : null

  return (
    <div className="divide-y divide-wefin-line/70">
      <div className="px-4 py-3.5">
        <div className="flex items-start justify-between gap-4 max-md:flex-col">
          <div>
            <p className="text-xs text-wefin-subtle">현재 소속 그룹</p>
            <p className="mt-0.5 text-sm font-medium text-wefin-text">{groupName}</p>

            {isLoggedIn && !isLoading && !isError ? (
              <p className="mt-2 text-sm text-wefin-subtle">
                {isHomeGroup ? '현재 홈 그룹에 속해 있어요.' : '현재 공유 그룹에 참여 중이에요.'}
              </p>
            ) : null}

            {isLoggedIn && isError ? (
              <p className="mt-2 text-sm text-red-500">{queryErrorMessage}</p>
            ) : null}

            {leaveGroupMutation.isSuccess ? (
              <p className="mt-2 text-sm text-wefin-mint">
                그룹에서 탈퇴했고 현재 홈 그룹으로 전환되었어요.
              </p>
            ) : null}

            {leaveGroupMutation.isError ? (
              <p className="mt-2 text-sm text-red-500">{leaveErrorMessage}</p>
            ) : null}

            {joinGroupMutation.isSuccess ? (
              <p className="mt-2 text-sm text-wefin-mint">그룹에 성공적으로 참여했어요.</p>
            ) : null}

            {joinGroupMutation.isError ? (
              <p className="mt-2 text-sm text-red-500">{joinErrorMessage}</p>
            ) : null}

            {createGroupMutation.isSuccess ? (
              <p className="mt-2 text-sm text-wefin-mint">새 그룹이 생성되었어요.</p>
            ) : null}

            {createGroupMutation.isError ? (
              <p className="mt-2 text-sm text-red-500">{createGroupErrorMessage}</p>
            ) : null}
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

      {!isHomeGroup && (
        <div className="px-4 py-3.5">
          <div className="mb-2 flex items-center gap-2">
            <label htmlFor="invite-code-input" className="text-sm font-semibold text-wefin-text">
              초대 코드
            </label>

            {statusDisplay ? (
              <span
                className={[
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                  statusDisplay.className
                ].join(' ')}
              >
                {statusDisplay.label}
              </span>
            ) : null}

            {canCreateInvite ? (
              <button
                type="button"
                onClick={() => void inviteCodeQuery.refetch()}
                disabled={inviteCodeQuery.isFetching}
                title="상태 새로고침"
                className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-lg text-wefin-subtle transition-colors hover:bg-wefin-bg hover:text-wefin-text disabled:opacity-50"
              >
                <RefreshCw size={12} className={inviteCodeQuery.isFetching ? 'animate-spin' : ''} />
              </button>
            ) : null}
          </div>

          <div className="flex gap-2">
            <input
              id="invite-code-input"
              type="text"
              readOnly
              value={
                hasInviteCode
                  ? inviteCode
                  : !isLoggedIn
                    ? '로그인 후 확인 가능'
                    : isLoading
                      ? '불러오는 중...'
                      : isHomeGroup
                        ? '홈 그룹은 초대 코드를 생성할 수 없어요'
                        : inviteCodeQuery.isLoading
                          ? '초대 코드 확인 중...'
                          : '생성 버튼을 눌러 초대 코드를 발급하세요'
              }
              className="h-11 flex-1 rounded-xl border border-wefin-line bg-wefin-bg px-4 text-sm text-wefin-subtle outline-none"
            />
            <button
              type="button"
              onClick={() => handleCopy(inviteCode, '초대 코드')}
              disabled={!hasInviteCode || isCodeConsumed}
              className={[
                'inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors',
                hasInviteCode && !isCodeConsumed
                  ? 'border-wefin-line text-wefin-text hover:bg-wefin-mint-soft/60'
                  : 'border-wefin-line text-wefin-text opacity-50'
              ].join(' ')}
            >
              <Copy size={16} />
              복사
            </button>
          </div>
        </div>
      )}

      {copyMessage ? <p className="text-sm font-medium text-wefin-mint">{copyMessage}</p> : null}

      {!isHomeGroup && isLoggedIn ? (
        <div className="px-4 py-3.5">
          <div className="flex items-start justify-between gap-3 max-md:flex-col">
            <div>
              <h3 className="text-base font-bold text-wefin-text">초대 코드 생성</h3>
              <p className="mt-1 text-sm leading-6 text-wefin-subtle">
                1회용 초대 코드를 발급해 멤버를 초대할 수 있어요. 사용 후에는 새로 생성해주세요.
              </p>

              {isCodeConsumed ? (
                <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
                  <p className="text-sm font-semibold text-orange-700">
                    초대 코드가 이미 사용되었어요.
                  </p>
                  <p className="mt-0.5 text-sm text-orange-600">
                    새 초대 코드를 생성해서 공유해보세요.
                  </p>
                </div>
              ) : null}

              {createInviteMutation.isSuccess && inviteCode && !isCodeConsumed ? (
                <p className="mt-2 text-sm text-wefin-mint">
                  새 초대 코드가 생성되었어요. 복사해서 공유해보세요.
                </p>
              ) : null}

              {createInviteMutation.isError ? (
                <p className="mt-2 text-sm text-red-500">{inviteErrorMessage}</p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handleCreateInvite}
              disabled={!canCreateInvite || isCreatingInvite}
              className={[
                'inline-flex h-11 min-w-[112px] items-center justify-center rounded-xl px-4 text-sm font-semibold text-white transition-colors',
                canCreateInvite && !isCreatingInvite
                  ? 'bg-wefin-mint hover:bg-[#2a8282]'
                  : 'bg-wefin-mint opacity-50'
              ].join(' ')}
            >
              {isCreatingInvite
                ? '생성 중...'
                : isCodeConsumed
                  ? '새 초대 코드 생성'
                  : '초대 코드 생성'}
            </button>
          </div>
        </div>
      ) : null}

      <div className={isHomeGroup ? 'grid divide-x divide-wefin-line md:grid-cols-2' : ''}>
        <div className="px-4 py-3.5">
          <h3 className="text-base font-bold text-wefin-text">기존 그룹 참여</h3>
          <p className="mt-1 text-sm leading-6 text-wefin-subtle">
            초대 코드를 입력하면 즉시 그룹 참여를 시도해요.
          </p>

          <div className="mt-4 flex gap-2 max-md:flex-col">
            <input
              type="text"
              value={inviteCodeInput}
              onChange={(e) => setInviteCodeInput(e.target.value)}
              disabled={!isLoggedIn || isJoiningGroup}
              placeholder={isLoggedIn ? '초대 코드 입력' : '로그인 후 이용할 수 있어요'}
              className="h-11 flex-1 rounded-xl border border-wefin-line bg-white px-4 text-sm text-wefin-text outline-none placeholder:text-wefin-subtle disabled:bg-wefin-bg"
            />
            <button
              type="button"
              onClick={handleJoinGroup}
              disabled={!canJoinGroup}
              className={[
                'inline-flex h-11 min-w-[96px] items-center justify-center rounded-xl px-4 text-sm font-semibold text-white transition-colors',
                canJoinGroup ? 'bg-wefin-mint hover:bg-[#2a8282]' : 'bg-wefin-mint opacity-50'
              ].join(' ')}
            >
              {isJoiningGroup ? '참여 중...' : '참여하기'}
            </button>
          </div>
        </div>

        {isHomeGroup ? (
          <div className="px-4 py-3.5">
            <h3 className="text-base font-bold text-wefin-text">새 그룹 만들기</h3>
            <p className="mt-1 text-sm leading-6 text-wefin-subtle">
              홈 그룹 상태에서 새 공유 그룹을 생성할 수 있어요.
            </p>

            <div className="mt-4 space-y-2">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                disabled={!isLoggedIn || isCreatingGroup || !isHomeGroup}
                placeholder={
                  !isLoggedIn
                    ? '로그인 후 이용할 수 있어요'
                    : !isHomeGroup
                      ? '공유 그룹에 참여 중이면 새 그룹을 만들 수 없어요'
                      : '그룹 이름을 입력해주세요'
                }
                className="h-11 w-full rounded-xl border border-wefin-line bg-white px-4 text-sm text-wefin-text outline-none transition-colors placeholder:text-wefin-subtle focus:border-wefin-mint disabled:bg-wefin-bg"
              />

              {newGroupName.trim() ? (
                <button
                  type="button"
                  onClick={handleCreateGroup}
                  disabled={!canCreateGroup}
                  className={[
                    'inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition-colors',
                    canCreateGroup ? 'bg-wefin-mint hover:bg-[#2a8282]' : 'bg-wefin-mint opacity-50'
                  ].join(' ')}
                >
                  <Plus size={16} />
                  {isCreatingGroup ? '생성 중...' : '생성하기'}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default SettingsGroupSection
