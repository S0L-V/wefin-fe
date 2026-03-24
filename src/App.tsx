import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import './App.css'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import SectionPage from './pages/SectionPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route
          path="stocks"
          element={
            <SectionPage
              label="실시간 주식"
              title="실시간 주식 화면을 여기에 구성하면 됩니다."
              description="시세 카드, 종목 목록, 상세 패널 같은 영역을 이 라우트에서 확장하면 됩니다."
            />
          }
        />
        <Route
          path="history"
          element={
            <SectionPage
              label="과거 기반"
              title="과거 기반 분석 화면 예시입니다."
              description="백테스트 결과, 추세 분석, 기간 비교 같은 기능을 붙이기 좋은 기본 페이지입니다."
            />
          }
        />
        <Route
          path="chat"
          element={
            <SectionPage
              label="채팅"
              title="채팅 화면 자리입니다."
              description="상담, AI 대화, 질의응답 인터페이스를 이 라우트 아래에 배치할 수 있습니다."
            />
          }
        />
        <Route
          path="settings"
          element={
            <SectionPage
              label="설정"
              title="설정 화면 자리입니다."
              description="계정, 알림, 개인화 옵션처럼 공통 설정 메뉴를 여기에 연결하면 됩니다."
            />
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
