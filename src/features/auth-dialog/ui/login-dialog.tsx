import { useLoginDialogStore } from '../model/use-login-dialog-store'

function LoginDialog() {
  const openLogin = useLoginDialogStore((state) => state.openLogin)

  return (
    <button
      type="button"
      onClick={openLogin}
      className="inline-flex h-[34px] min-w-[88px] items-center justify-center rounded-[9px] bg-[#56c1c9] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#48b4bc]"
    >
      로그인
    </button>
  )
}

export default LoginDialog
