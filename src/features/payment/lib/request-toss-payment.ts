const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY

export async function requestTossPayment(ready: {
  amount: number
  orderId: string
  planName: string
}) {
  if (!window.TossPayments) {
    throw new Error('토스 SDK 로드 안됨')
  }

  if (!TOSS_CLIENT_KEY) {
    throw new Error('client key 없음')
  }

  const tossPayments = window.TossPayments(TOSS_CLIENT_KEY)

  await tossPayments.requestPayment('카드', {
    amount: ready.amount,
    orderId: ready.orderId,
    orderName: ready.planName,
    successUrl: `${window.location.origin}/payment/success`,
    failUrl: `${window.location.origin}/payment/fail`
  })
}
