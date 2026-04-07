import { Route, Routes } from 'react-router-dom'

import AdminPage from '@/pages/admin/ui/admin-page'
import ChatPage from '@/pages/chat/ui/chat-page'
import CreateRoomPage from '@/pages/history/ui/create-room-page'
import HistoryPage from '@/pages/history/ui/history-page'
import PlayPage from '@/pages/history/ui/play-page'
import ResultPage from '@/pages/history/ui/result-page'
import RoomPage from '@/pages/history/ui/room-page'
import HomePage from '@/pages/home/ui/home-page'
import NotFoundPage from '@/pages/not-found/ui/not-found-page'
import SettingsPage from '@/pages/settings/ui/settings-page'
import StocksPage from '@/pages/stocks/ui/stocks-page'
import AppLayout from '@/widgets/app-layout/ui/app-layout'

function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="stocks" element={<StocksPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="history/create" element={<CreateRoomPage />} />
        <Route path="history/room/:roomId" element={<RoomPage />} />
        <Route path="history/room/:roomId/play" element={<PlayPage />} />
        <Route path="history/room/:roomId/result" element={<ResultPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default AppRouter
