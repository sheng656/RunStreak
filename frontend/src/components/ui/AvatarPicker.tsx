import { useState } from 'react'

const STYLE_LIST = [
  { key: 'avataaars', label: 'Portraits' },
  { key: 'lorelei', label: 'Watercolor' },
  { key: 'personas', label: 'Flat Color' },
  { key: 'micah', label: 'Minimalist' },
  { key: 'notionists', label: 'Notionist' },
  { key: 'open-peeps', label: 'Street Art' },
  { key: 'croodles', label: 'Scribbles' },
  { key: 'adventurer', label: 'Adventure' },
  { key: 'bottts', label: 'Robots' },
  { key: 'pixel-art', label: '8-Bit Retro' },
  { key: 'identicon', label: 'Symmetric' },
  { key: 'shapes', label: 'Shapes' },
  { key: 'rings', label: 'Rings' },
  { key: 'initials', label: 'Initials' }
] as const

type AvatarStyle = typeof STYLE_LIST[number]['key']

const CHARACTER_SEEDS = [
  'Jack', 'Lily', 'Leo', 'Ruby', 'Max', 'Mia', 'Sam', 'Zoe',
  'Alex', 'Eva', 'Toby', 'Chloe', 'Felix', 'Luna', 'Oscar', 'Ivy',
  'Buster', 'Sparky', 'Gizmo', 'Robo', 'Rusty', 'Bolt', 'Gear', 'Pixel'
]

const PATTERN_SEEDS = [
  'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta',
  'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi',
  'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega'
]

const INITIALS_SEEDS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  'RUN', 'GO', 'FIT', 'PACE', 'JOG', 'WIN', 'FAST', 'DASH', 'MOVE', 'HOT',
  'GOAL', 'FITNESS', 'PACE', 'STREAK', 'NZ', 'MSA'
]

interface AvatarPickerProps {
  selectedUrl: string
  onSelect: (url: string) => void
}

export default function AvatarPicker({ selectedUrl, onSelect }: AvatarPickerProps) {
  const [activeStyle, setActiveStyle] = useState<AvatarStyle>('avataaars')

  const getAvatarsForStyle = () => {
    if (activeStyle === 'initials') {
      return INITIALS_SEEDS.map(seed => ({
        url: `https://api.dicebear.com/9.x/initials/svg?seed=${seed}`,
        name: `Initials ${seed}`
      }))
    }

    if (activeStyle === 'identicon' || activeStyle === 'shapes' || activeStyle === 'rings') {
      return PATTERN_SEEDS.map(seed => ({
        url: `https://api.dicebear.com/9.x/${activeStyle}/svg?seed=${seed}`,
        name: `${activeStyle} ${seed}`
      }))
    }

    return CHARACTER_SEEDS.map(seed => ({
      url: `https://api.dicebear.com/9.x/${activeStyle}/svg?seed=${seed}`,
      name: `${activeStyle} ${seed}`
    }))
  }

  const avatars = getAvatarsForStyle()

  return (
    <div className="space-y-4">
      {/* Scrollable list of styles */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
        {STYLE_LIST.map((style) => {
          const isActive = activeStyle === style.key
          return (
            <button
              key={style.key}
              type="button"
              onClick={() => setActiveStyle(style.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap snap-align-start transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[hsl(var(--color-brand))]/10 text-[hsl(var(--color-brand))] border border-[hsl(var(--color-brand))]/30'
                  : 'text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-surface-3))] hover:text-[hsl(var(--color-text))] bg-[hsl(var(--color-surface-2))]/30 border border-transparent'
              }`}
            >
              {style.label}
            </button>
          )
        })}
      </div>

      {/* Grid of Avatars */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-64 overflow-y-auto p-3 bg-[hsl(var(--color-surface-3))]/20 rounded-xl border border-[hsl(var(--color-border))]/20">
        {avatars.map(({ url, name }) => {
          const isSelected = selectedUrl === url
          return (
            <button
              key={url}
              type="button"
              onClick={() => onSelect(url)}
              className={`relative aspect-square rounded-full p-1 bg-[hsl(var(--color-surface))] transition-all duration-200 hover:scale-110 active:scale-95 border-2 cursor-pointer ${
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
