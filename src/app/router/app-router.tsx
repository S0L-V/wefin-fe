import { Route, Routes } from 'react-router-dom'

import ProtectedRoute from '@/app/providers/protected-route'
import AdminPage from '@/pages/admin/ui/admin-page'
import ChatPage from '@/pages/chat/ui/chat-page'
import HistoryPage from '@/pages/history/ui/history-page'
import HomePage from '@/pages/home/ui/home-page'
import NotFoundPage from '@/pages/not-found/ui/not-found-page'
import SettingsPage from '@/pages/settings/ui/settings-page'
import StockDetailPage from '@/pages/stocks/ui/stock-detail-page'
import StocksPage from '@/pages/stocks/ui/stocks-page'
import AppLayout from '@/widgets/app-layout/ui/app-layout'

function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="stocks" element={<StocksPage />} />
        <Route path="stocks/:code" element={<StockDetailPage />} />

        <Route
          path="history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default AppRouter
