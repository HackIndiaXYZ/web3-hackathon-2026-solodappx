import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AnimatePresence } from 'framer-motion'

import { fetchProfile } from './store/slices/authSlice'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'
import ParticleField from './components/common/ParticleField'

// Pages
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import WalletPage from './pages/WalletPage'
import CredentialsPage from './pages/CredentialsPage'
import AIAssistantPage from './pages/AIAssistantPage'
import ProfilePage from './pages/ProfilePage'
import VerifyPage from './pages/VerifyPage'
import AboutPage from './pages/AboutPage'
import NotFoundPage from './pages/NotFoundPage'
import PublicProfilePage from './pages/PublicProfilePage'
import TransactionHistoryPage from './pages/TransactionHistoryPage'

export default function App() {
  const dispatch = useDispatch()
  const { token } = useSelector(state => state.auth)

  // Auto-fetch profile if token exists
  useEffect(() => {
    if (token) dispatch(fetchProfile())
  }, [token, dispatch])

  return (
    <div className="relative min-h-screen bg-dark-900">
      <ParticleField />
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/verify/:id" element={<VerifyPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/public" element={<PublicProfilePage />} />
          <Route path="/public/:address" element={<PublicProfilePage />} />

          {/* Protected routes inside Layout */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/credentials" element={<CredentialsPage />} />
            <Route path="/ai-assistant" element={<AIAssistantPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/transactions" element={<TransactionHistoryPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}
