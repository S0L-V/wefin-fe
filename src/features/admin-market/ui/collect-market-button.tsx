import { useCollectMarket } from '../model/use-collect-market'

function CollectMarketButton() {
  const { mutate, isPending, isSuccess, isError, error } = useCollectMarket()

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => mutate()}
        disabled={isPending}
        className="rounded-lg bg-wefin-mint px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-wefin-mint/90 disabled:opacity-50"
      >
        {isPending ? '수집 중...' : '시장 지표 수집'}
      </button>
      {isSuccess && <p className="text-sm text-green-600">수집 완료</p>}
      {isError && <p className="text-sm text-red-600">수집 실패: {error.message}</p>}
    </div>
  )
}

export default CollectMarketButton
