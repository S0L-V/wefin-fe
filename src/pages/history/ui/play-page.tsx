import { useParams } from 'react-router-dom'

function PlayPage() {
  const { roomId } = useParams<{ roomId: string }>()

  if (!roomId) {
    return <div className="text-center py-20 text-wefin-subtle">잘못된 접근입니다</div>
  }

  return (
    <div className="text-center py-20">
      <h2 className="text-xl font-bold text-wefin-text mb-2">게임 진행 중</h2>
      <p className="text-wefin-subtle">게임 진행 페이지는 준비 중입니다.</p>
    </div>
  )
}

export default PlayPage
