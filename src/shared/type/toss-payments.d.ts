export {}

declare global {
  interface Window {
    TossPayments: (clientKey: string) => {
      requestPayment: (
        method: '카드' | '가상계좌' | '계좌이체',
        params: {
          amount: number
          orderId: string
          orderName: string
          successUrl: string
          failUrl: string
        }
      ) => Promise<void>
    }
  }
}
