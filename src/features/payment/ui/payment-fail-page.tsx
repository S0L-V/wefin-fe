import { useSearchParams } from 'react-router-dom'

export default function PaymentFailPage() {
  const [searchParams] = useSearchParams()

  const code = searchParams.get('code')
  const message = searchParams.get('message')

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-wefin-line bg-wefin-surface px-6 py-8 shadow-sm">
        <h1 className="text-xl font-semibold text-wefin-text">결제에 실패했어요</h1>

        <div className="mt-4 space-y-2 text-sm text-wefin-subtle">
          <p>
            <span className="font-medium text-wefin-text">에러 코드:</span> {code ?? '-'}
          </p>
          <p>
            <span className="font-medium text-wefin-text">메시지:</span>{' '}
            {message ?? '결제가 취소되었거나 처리 중 오류가 발생했습니다.'}
          </p>
        </div>
      </div>
    </div>
  )
}
