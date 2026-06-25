import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="mb-4 text-[hsl(var(--color-text-muted))] opacity-50">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[hsl(var(--color-text))] mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[hsl(var(--color-text-muted))] max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
