import { useLoginDialogStore } from '../model/use-login-dialog-store'

function LoginDialog() {
  const openLogin = useLoginDialogStore((state) => state.openLogin)

  return (
    <button
      type="button"
      onClick={openLogin}
      className="inline-flex h-9 items-center justify-center rounded-full border border-wefin-mint-deep/30 bg-wefin-mint-deep/5 px-5 text-sm font-bold text-wefin-mint-deep backdrop-blur-sm transition-all hover:border-wefin-mint-deep/50 hover:bg-wefin-mint-deep hover:text-white hover:shadow-[0_0_16px_rgba(36,168,171,0.25)]"
    >
      로그인
    </button>
  )
}

export default LoginDialog
