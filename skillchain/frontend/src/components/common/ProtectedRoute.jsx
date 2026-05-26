import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useSelector(s => s.auth)
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
          <p className="text-neon-cyan font-mono text-sm tracking-widest animate-pulse">
            AUTHENTICATING...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return children
}
