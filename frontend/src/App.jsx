import { Navigate, Route, Routes } from 'react-router-dom'
import FloatingShape from './components/FloatingShape'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import EmailVerificationPage from './pages/EmailVerificationPage'

import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import { useEffect } from 'react'
import DashBoardPage from './pages/DashBoardPage'
import LoadingSpinner from './components/LoadingSpinner'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

// Chuyen huong nguoi dung
const Redicrect = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()

  if (isAuthenticated && user.isVerified) {
    return <Navigate to="/" replace />
  }

  return children
}

const ProtectRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace />
  }

  return children
}

function App() {
  const { isCheckingAuth, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isCheckingAuth) return <LoadingSpinner />

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-900 
    via-green-900 to-emerald-900 relative overflow-hidden flex items-center justify-center"
    >
      <FloatingShape
        color="bg-green-500"
        size="w-64 h-64"
        top="-5%"
        left="10%"
        delay={0}
      />
      <FloatingShape
        color="bg-emerald-500"
        size="w-48 h-48"
        top="70%"
        left="80%"
        delay={5}
      />
      <FloatingShape
        color="bg-lime-500"
        size="w-32 h-32"
        top="40%"
        left="-10%"
        delay={2}
      />

      <Routes>
        <Route
          path="/"
          element={
            <ProtectRoute>
              <DashBoardPage />
            </ProtectRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <Redicrect>
              <SignUpPage />
            </Redicrect>
          }
        />
        <Route
          path="/login"
          element={
            <Redicrect>
              <LoginPage />
            </Redicrect>
          }
        />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route
          path="/forgot-password"
          element={
            <Redicrect>
              <ForgotPasswordPage />
            </Redicrect>
          }
        />

        <Route
          path="/reset-password/:token"
          element={
            <Redicrect>
              <ResetPasswordPage />
            </Redicrect>
          }
        />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App