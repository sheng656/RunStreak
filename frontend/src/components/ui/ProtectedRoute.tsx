import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import LoadingSpinner from './LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Wraps protected pages — redirects to /login if the user is not authenticated.
 * While the silent refresh is in progress (isLoading), shows a spinner to
 * avoid a flash of the login page.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--color-bg))]">
        <LoadingSpinner size="lg" text="Restoring your session..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
