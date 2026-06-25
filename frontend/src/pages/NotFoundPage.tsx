import { Link } from 'react-router-dom'
import { MapPin, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--color-bg))] px-4">
      <div className="text-center animate-bounce-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[hsl(var(--color-surface-2))] mb-6">
          <MapPin size={40} className="text-[hsl(var(--color-text-muted))]" />
        </div>
        <h1 className="text-6xl font-extrabold gradient-text mb-2">404</h1>
        <h2 className="text-xl font-semibold text-[hsl(var(--color-text))] mb-2">
          You ran off course!
        </h2>
        <p className="text-sm text-[hsl(var(--color-text-muted))] mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist. Let's get you back on track.
        </p>
        <Link to="/" className="btn btn-primary btn-lg">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
