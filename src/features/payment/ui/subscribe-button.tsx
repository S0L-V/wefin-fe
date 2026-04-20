import { requestTossPayment } from '../lib/request-toss-payment'
import { useCreatePaymentMutation } from '../model/payment.query'

type Props = {
  planId: number
}

export default function SubscribeButton({ planId }: Props) {
  const { mutateAsync, isPending } = useCreatePaymentMutation()

  const handleClick = async () => {
    try {
      console.log('[payment] button clicked')
      const ready = await mutateAsync(planId)
      console.log('[payment] createPayment success', ready)

      await requestTossPayment({
        amount: ready.amount,
        orderId: ready.orderId,
        planName: ready.planName
      })
    } catch (error) {
      console.error('[payment] failed', error)
      alert('결제 요청 중 오류가 발생했습니다. 콘솔과 네트워크 탭을 확인해주세요.')
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium"
    >
      {isPending ? '결제 준비 중...' : '구독하기'}
    </button>
  )
}
