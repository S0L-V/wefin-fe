import { useCollectNews, useCrawlNews } from '../model/use-collect-news'

function NewsCollectButtons() {
  const collect = useCollectNews()
  const crawl = useCrawlNews()

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => collect.mutate()}
          disabled={collect.isPending}
          className="rounded-lg bg-wefin-mint px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-wefin-mint/90 disabled:opacity-50"
        >
          {collect.isPending ? '수집 중...' : '뉴스 수집'}
        </button>
        <button
          type="button"
          onClick={() => crawl.mutate()}
          disabled={crawl.isPending}
          className="rounded-lg bg-wefin-mint px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-wefin-mint/90 disabled:opacity-50"
        >
          {crawl.isPending ? '크롤링 중...' : '뉴스 크롤링'}
        </button>
      </div>
      {collect.isSuccess && <p className="text-sm text-green-600">뉴스 수집 완료</p>}
      {collect.isError && (
        <p className="text-sm text-red-600">뉴스 수집 실패: {collect.error.message}</p>
      )}
      {crawl.isSuccess && <p className="text-sm text-green-600">뉴스 크롤링 완료</p>}
      {crawl.isError && (
        <p className="text-sm text-red-600">뉴스 크롤링 실패: {crawl.error.message}</p>
      )}
    </div>
  )
}

export default NewsCollectButtons
