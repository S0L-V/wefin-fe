import { requestTossPayment } from '../lib/request-toss-payment'
import { useCreatePaymentMutation } from '../model/payment.query'

type Props = {
  planId: number
}

export default function SubscribeButton({ planId }: Props) {
  const { mutateAsync, isPending } = useCreatePaymentMutation()

  const handleClick = async () => {
    const ready = await mutateAsync(planId)

    await requestTossPayment({
      amount: ready.amount,
      orderId: ready.orderId,
      planName: ready.planName
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="h-12 w-full rounded-xl bg-wefin-mint text-sm font-bold text-white transition-all shadow-md hover:bg-wefin-mint-deep hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-wefin-line disabled:text-wefin-subtle disabled:shadow-none"
    >
      {isPending ? '결제 요청 중...' : '구독하기'}
    </button>
  )
}
