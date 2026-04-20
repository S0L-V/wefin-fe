import { Route, Routes } from 'react-router-dom'

import ProtectedRoute from '@/app/providers/protected-route'
import PaymentFailPage from '@/features/payment/ui/payment-fail-page'
import PaymentSuccessPage from '@/features/payment/ui/payment-success-page'
import AccountPage from '@/pages/account/ui/account-page'
import AdminPage from '@/pages/admin/ui/admin-page'
import ChatPage from '@/pages/chat/ui/chat-page'
import ArchivePage from '@/pages/history/ui/archive-page'
import CreateRoomPage from '@/pages/history/ui/create-room-page'
import HistoryPage from '@/pages/history/ui/history-page'
import PlayPage from '@/pages/history/ui/play-page'
import ResultPage from '@/pages/history/ui/result-page'
import RoomPage from '@/pages/history/ui/room-page'
import HomePage from '@/pages/home/ui/home-page'
import InterestsPage from '@/pages/interests/ui/interests-page'
import AboutPage from '@/pages/legal/ui/about-page'
import PrivacyPage from '@/pages/legal/ui/privacy-page'
import TermsPage from '@/pages/legal/ui/terms-page'
import ClusterDetailPage from '@/pages/news/ui/cluster-detail-page'
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
        <Route path="news" element={<HomePage />} />
        <Route path="news/:clusterId" element={<ClusterDetailPage />} />
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
          path="history/archive"
          element={
            <ProtectedRoute>
              <ArchivePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="history/create"
          element={
            <ProtectedRoute>
              <CreateRoomPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="history/room/:roomId"
          element={
            <ProtectedRoute>
              <RoomPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="history/room/:roomId/play"
          element={
            <ProtectedRoute>
              <PlayPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="history/room/:roomId/result"
          element={
            <ProtectedRoute>
              <ResultPage />
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
          path="account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="interests"
          element={
            <ProtectedRoute>
              <InterestsPage />
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

        <Route path="payment/success" element={<PaymentSuccessPage />} />
        <Route path="payment/fail" element={<PaymentFailPage />} />

        <Route
          path="admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route path="terms" element={<TermsPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="about" element={<AboutPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default AppRouter
