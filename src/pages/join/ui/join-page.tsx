import { LoaderCircle, Users } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { useJoinGroupMutation } from '@/features/settings/model/use-join-group-mutation'
import { ApiError } from '@/shared/api/base-api'
import { routes } from '@/shared/config/routes'

function JoinPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const requestedInviteCodeRef = useRef<string | null>(null)

  const inviteCode = searchParams.get('code')?.trim() ?? ''

  const joinGroupMutation = useJoinGroupMutation(() => {
    navigate(routes.settings, { replace: true })
  })

  useEffect(() => {
    if (!inviteCode || requestedInviteCodeRef.current === inviteCode) {
      return
    }

    requestedInviteCodeRef.current = inviteCode
    joinGroupMutation.mutate({ inviteCode })
  }, [inviteCode, joinGroupMutation])

  const handleRetry = () => {
    if (!inviteCode || joinGroupMutation.isPending) {
      return
    }

    joinGroupMutation.reset()
    requestedInviteCodeRef.current = null
  }

  const errorMessage =
    joinGroupMutation.error instanceof ApiError
      ? joinGroupMutation.error.code === 'GROUP_ALREADY_JOINED'
        ? '이미 참여 중인 그룹이에요. 설정 페이지에서 현재 그룹을 확인해 주세요.'
        : joinGroupMutation.error.code === 'GROUP_INVITE_ALREADY_USED'
          ? '이미 사용된 초대 코드예요. 새 초대 코드를 받아 다시 시도해 주세요.'
          : joinGroupMutation.error.message
      : '그룹 참여 중 오류가 발생했어요.'

  if (!inviteCode) {
    return (
      <section className="mx-auto max-w-xl rounded-3xl border border-wefin-line bg-white p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-wefin-mint-soft text-wefin-mint">
            <Users size={22} />
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-wefin-text">유효한 초대 링크가 아니에요</h1>
            <p className="mt-2 text-sm leading-6 text-wefin-subtle">
              초대 코드가 없는 링크예요. 다시 받은 초대 링크로 접속해 주세요.
            </p>

            <div className="mt-6">
              <Link
                to={routes.settings}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-wefin-mint px-5 text-sm font-semibold text-white transition-colors hover:bg-[#2a8282]"
              >
                설정으로 이동
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-xl rounded-3xl border border-wefin-line bg-white p-8 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-wefin-mint-soft text-wefin-mint">
          <Users size={22} />
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-wefin-text">그룹 참여</h1>

          {joinGroupMutation.isPending ? (
            <>
              <p className="mt-2 text-sm leading-6 text-wefin-subtle">
                초대 링크를 확인했고 그룹 참여를 진행하고 있어요.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-wefin-line bg-wefin-bg px-4 py-3 text-sm text-wefin-text">
                <LoaderCircle size={18} className="animate-spin text-wefin-mint" />
                참여 처리 중...
              </div>
            </>
          ) : null}

          {joinGroupMutation.isError ? (
            <>
              <p className="mt-2 text-sm leading-6 text-wefin-subtle">
                초대 링크로 그룹 참여를 시도했지만 완료되지 않았어요.
              </p>
              <p className="mt-4 text-sm font-medium text-red-500">{errorMessage}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={routes.settings}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-wefin-mint px-5 text-sm font-semibold text-white transition-colors hover:bg-[#2a8282]"
                >
                  설정으로 이동
                </Link>

                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={joinGroupMutation.isPending}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-wefin-line px-5 text-sm font-semibold text-wefin-text transition-colors hover:bg-wefin-mint-soft/60 disabled:opacity-50"
                >
                  다시 시도
                </button>
              </div>
            </>
          ) : null}

          {joinGroupMutation.isSuccess ? (
            <>
              <p className="mt-2 text-sm leading-6 text-wefin-subtle">
                그룹 참여가 완료되어 설정 페이지로 이동하고 있어요.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-wefin-line bg-wefin-bg px-4 py-3 text-sm text-wefin-text">
                <LoaderCircle size={18} className="animate-spin text-wefin-mint" />
                이동 중...
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default JoinPage
