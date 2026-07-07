import { useState } from 'react'

const ADVENTURER_SEEDS = [
  'Jack', 'Lily', 'Leo', 'Ruby', 'Max', 'Mia', 'Sam', 'Zoe',
  'Alex', 'Eva', 'Toby', 'Chloe', 'Felix', 'Luna', 'Oscar', 'Ivy'
]
const BOTTTS_SEEDS = [
  'Buster', 'Sparky', 'Gizmo', 'Robo', 'Rusty', 'Bolt', 'Gear', 'Pixel',
  'Byte', 'Circuit', 'Widget', 'Chip', 'Nano', 'Vector', 'Turbo', 'Alpha'
]
const FUN_EMOJI_SEEDS = [
  'Happy', 'Cool', 'Wink', 'Love', 'Silly', 'Nerdy', 'Gamer', 'Star',
  'Angel', 'Sleepy', 'Thinking', 'Shocked', 'Laugh', 'Party', 'Grin', 'Sweat'
]

interface AvatarPickerProps {
  selectedUrl: string
  onSelect: (url: string) => void
}

export default function AvatarPicker({ selectedUrl, onSelect }: AvatarPickerProps) {
  const [activeTab, setActiveTab] = useState<'characters' | 'robots' | 'emojis'>('characters')

  const getAvatarsForTab = () => {
    switch (activeTab) {
      case 'characters':
        return ADVENTURER_SEEDS.map(seed => ({
          url: `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`,
          name: seed
        }))
      case 'robots':
        return BOTTTS_SEEDS.map(seed => ({
          url: `https://api.dicebear.com/9.x/bottts/svg?seed=${seed}`,
          name: seed
        }))
      case 'emojis':
        return FUN_EMOJI_SEEDS.map(seed => ({
          url: `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${seed}`,
          name: seed
        }))
    }
  }

  const avatars = getAvatarsForTab()

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-[hsl(var(--color-border))]/30 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('characters')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'characters'
              ? 'bg-[hsl(var(--color-brand))]/10 text-[hsl(var(--color-brand))] border border-[hsl(var(--color-brand))]/30'
              : 'text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-surface-3))]'
          }`}
        >
          Characters ({ADVENTURER_SEEDS.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('robots')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'robots'
              ? 'bg-[hsl(var(--color-brand))]/10 text-[hsl(var(--color-brand))] border border-[hsl(var(--color-brand))]/30'
              : 'text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-surface-3))]'
          }`}
        >
          Robots ({BOTTTS_SEEDS.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('emojis')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'emojis'
              ? 'bg-[hsl(var(--color-brand))]/10 text-[hsl(var(--color-brand))] border border-[hsl(var(--color-brand))]/30'
              : 'text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-surface-3))]'
          }`}
        >
          Emojis ({FUN_EMOJI_SEEDS.length})
        </button>
      </div>

      {/* Grid of Avatars */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 max-h-60 overflow-y-auto p-2 bg-[hsl(var(--color-surface-3))]/20 rounded-xl border border-[hsl(var(--color-border))]/20">
        {avatars.map(({ url, name }) => {
          const isSelected = selectedUrl === url
          return (
            <button
              key={url}
              type="button"
              onClick={() => onSelect(url)}
              className={`relative aspect-square rounded-full p-1 bg-[hsl(var(--color-surface))] transition-all hover:scale-110 active:scale-95 border-2 ${
                isSelected
                  ? 'border-[hsl(var(--color-brand))] shadow-md ring-2 ring-[hsl(var(--color-brand))]/20'
                  : 'border-[hsl(var(--color-border))]/40 hover:border-[hsl(var(--color-text-muted))]'
              }`}
              title={name}
            >
              <img
                src={url}
                alt={name}
                loading="lazy"
                className="w-full h-full object-contain rounded-full"
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
