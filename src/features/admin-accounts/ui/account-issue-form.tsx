import { useAccountIssueForm } from '../model/use-account-issue-form'

function AccountIssueForm() {
  const {
    form,
    fieldErrors,
    issuedAccount,
    errorMessage,
    isPending,
    isError,
    handleChange,
    handleSubmit
  } = useAccountIssueForm()

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-wefin-text">계정 유형</span>
          <select
            value={form.accountType}
            onChange={handleChange('accountType')}
            className="w-full rounded-lg border border-wefin-line bg-white px-3 py-2 text-sm text-wefin-text outline-none focus:border-wefin-mint"
          >
            <option value="CONTEST">대회 계정</option>
            <option value="BUSINESS">비즈니스 계정</option>
          </select>
          {fieldErrors.accountType && (
            <p className="text-xs text-wefin-red">{fieldErrors.accountType}</p>
          )}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-wefin-text">이메일</span>
          <input
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            placeholder="contest-2026-001@wefin.local"
            className="w-full rounded-lg border border-wefin-line bg-white px-3 py-2 text-sm text-wefin-text outline-none focus:border-wefin-mint"
          />
          {fieldErrors.email && <p className="text-xs text-wefin-red">{fieldErrors.email}</p>}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-wefin-text">닉네임</span>
          <input
            type="text"
            value={form.nickname}
            onChange={handleChange('nickname')}
            placeholder="contest001"
            className="w-full rounded-lg border border-wefin-line bg-white px-3 py-2 text-sm text-wefin-text outline-none focus:border-wefin-mint"
          />
          {fieldErrors.nickname && <p className="text-xs text-wefin-red">{fieldErrors.nickname}</p>}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-wefin-text">임시 비밀번호</span>
          <input
            type="text"
            value={form.password}
            onChange={handleChange('password')}
            placeholder="Temp1234"
            className="w-full rounded-lg border border-wefin-line bg-white px-3 py-2 text-sm text-wefin-text outline-none focus:border-wefin-mint"
          />
          {fieldErrors.password && <p className="text-xs text-wefin-red">{fieldErrors.password}</p>}
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-wefin-text">배정 그룹 ID 선택</span>
          <input
            type="number"
            min={1}
            value={form.targetGroupId ?? ''}
            onChange={handleChange('targetGroupId')}
            placeholder="비워두면 개인 홈그룹으로 발급"
            className="w-full rounded-lg border border-wefin-line bg-white px-3 py-2 text-sm text-wefin-text outline-none focus:border-wefin-mint"
          />
          <p className="text-xs text-wefin-subtle">
            공유 그룹 ID를 입력하면 발급 즉시 해당 그룹의 멤버로 배정됩니다.
          </p>
          {fieldErrors.targetGroupId && (
            <p className="text-xs text-wefin-red">{fieldErrors.targetGroupId}</p>
          )}
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-wefin-mint px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-wefin-mint/90 disabled:opacity-50"
        >
          {isPending ? '발급 중...' : '계정 발급'}
        </button>
        <p className="text-xs text-wefin-subtle">
          발급 계정은 이메일 인증 없이 생성되며 기본 그룹과 가상계좌가 함께 생성됩니다.
        </p>
      </div>

      {issuedAccount && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <p className="font-semibold">계정 발급 완료</p>
          <p>이메일: {issuedAccount.email}</p>
          <p>닉네임: {issuedAccount.nickname}</p>
          <p>유형: {issuedAccount.accountType}</p>
          <p>활성 그룹: {issuedAccount.activeGroupName}</p>
          <p>활성 그룹 ID: {issuedAccount.activeGroupId}</p>
        </div>
      )}

      {isError && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-wefin-red">
          {errorMessage}
        </p>
      )}
    </form>
  )
}

export default AccountIssueForm
