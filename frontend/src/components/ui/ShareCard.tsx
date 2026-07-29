import { X, Download, Copy, Share2, Sparkles } from 'lucide-react'
import { useShareCard, type ShareCardVariant } from '../../utils/useShareCard'
import type { UserProfile, UserStats, BadgeWithProgress, Run } from '../../types/api'
import toast from 'react-hot-toast'

interface ShareCardProps {
  variant: ShareCardVariant
  user?: UserProfile | null
  stats?: UserStats | null
  badge?: BadgeWithProgress | null
  run?: Run | null
  challengeName?: string
  onClose: () => void
}

export default function ShareCard({
  variant,
  user,
  stats,
  badge,
  run,
  challengeName,
  onClose,
}: ShareCardProps) {
  const { canvasRef, isGenerating, downloadImage, copyShareText } = useShareCard({
    variant,
    user,
    stats,
    badge,
    run,
    challengeName,
  })

  function handleCopyText() {
    copyShareText()
    toast.success('Share text copied to clipboard!')
  }

  function handleDownload() {
    downloadImage()
    toast.success('Downloading your brag card!')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="card p-6 max-w-2xl w-full space-y-5 bg-slate-900 border border-slate-700/80 shadow-2xl relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl gradient-fire text-white">
            <Share2 size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Share Your Brag Card <Sparkles size={16} className="text-amber-400" />
            </h2>
            <p className="text-xs text-slate-400">
              Download high-res PNG or copy formatted text for social media
            </p>
          </div>
        </div>

        {/* Canvas Preview Box */}
        <div className="relative w-full overflow-hidden rounded-xl border border-slate-700/60 bg-slate-950 flex items-center justify-center aspect-[1200/630]">
          {isGenerating && (
            <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center text-xs text-slate-400 gap-2">
              <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
              <span>Generating card image...</span>
            </div>
          )}
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain max-h-[340px]"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            title={isGenerating ? 'Please wait — card is still rendering…' : 'Download PNG'}
            className="btn btn-primary flex items-center justify-center gap-2"
          >
            <Download size={18} />
            <span>Download Image (PNG)</span>
          </button>
          <button
            type="button"
            onClick={handleCopyText}
            className="btn btn-secondary flex items-center justify-center gap-2"
          >
            <Copy size={18} />
            <span>Copy Share Text</span>
          </button>
        </div>
      </div>
    </div>
  )
}
