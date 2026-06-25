export default function LoadingSpinner({ size = 'md', text }: { size?: 'sm' | 'md' | 'lg'; text?: string }) {
  const sizeMap = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeMap[size]} rounded-full border-2 border-[hsl(var(--color-border))] border-t-[hsl(var(--color-brand))] animate-spin`}
      />
      {text && (
        <p className="text-sm text-[hsl(var(--color-text-muted))]">{text}</p>
      )}
    </div>
  )
}
