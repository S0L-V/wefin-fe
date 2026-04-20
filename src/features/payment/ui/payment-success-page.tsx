import { useNavigate, useSearchParams } from 'react-router-dom'

import { useConfirmPaymentMutation } from '../model/payment.query'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const confirmPaymentMutation = useConfirmPaymentMutation()

  const paymentKey = searchParams.get('paymentKey')
  const orderId = searchParams.get('orderId')
  const amountParam = searchParams.get('amount')

  const handleConfirm = () => {
    console.log('[payment-success] confirm click', {
      paymentKey,
      orderId,
      amountParam
    })

    if (!paymentKey || !orderId || !amountParam) {
      alert('결제 승인에 필요한 값이 없습니다.')
      navigate('/payment/fail', { replace: true })
      return
    }

    const amount = Number(amountParam)

    if (Number.isNaN(amount) || amount <= 0) {
      alert('결제 금액 정보가 올바르지 않습니다.')
      navigate('/payment/fail', { replace: true })
      return
    }

    confirmPaymentMutation.mutate(
      {
        paymentKey,
        orderId,
        amount
      },
      {
        onSuccess: (data) => {
          console.log('[payment-success] confirm success', data)
          alert('구독 결제가 완료되었습니다.')
          navigate('/settings', { replace: true })
        },
        onError: (error) => {
          console.error('[payment-success] confirm failed', error)
          alert('결제 승인에 실패했습니다.')
          navigate('/payment/fail', { replace: true })
        }
      }
    )
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="rounded-2xl border border-wefin-line bg-wefin-surface px-6 py-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-wefin-text">결제 승인 대기</h1>
        <p className="mt-2 text-sm text-wefin-subtle">아래 버튼을 눌러 결제를 완료하세요.</p>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={confirmPaymentMutation.isPending}
          className="mt-6 rounded-xl bg-black px-4 py-3 text-white disabled:opacity-50"
        >
          {confirmPaymentMutation.isPending ? '처리 중...' : '결제 완료'}
        </button>
      </div>
    </div>
  )
}
