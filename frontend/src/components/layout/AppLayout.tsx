import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

/**
 * Shell layout for all authenticated pages.
 * Desktop: Navbar + Sidebar + content area.
 * Mobile: Navbar + content area + BottomNav.
 */
export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[hsl(var(--color-bg))]">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-[calc(100vh-3.5rem)] pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
