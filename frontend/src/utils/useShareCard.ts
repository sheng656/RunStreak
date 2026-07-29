import { useRef, useState, useEffect, useCallback } from 'react'
import type { UserProfile, UserStats, BadgeWithProgress, Run } from '../types/api'

export type ShareCardVariant = 'profile' | 'badge' | 'run'

interface UseShareCardOptions {
  variant: ShareCardVariant
  user?: UserProfile | null
  stats?: UserStats | null
  badge?: BadgeWithProgress | null
  run?: Run | null
  challengeName?: string
}

export function useShareCard({
  variant,
  user,
  stats,
  badge,
  run,
  challengeName,
}: UseShareCardOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isGenerating, setIsGenerating] = useState(true)

  const drawCard = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsGenerating(true)

    // Canvas size (standard 1200x630 OpenGraph image)
    const width = 1200
    const height = 630
    canvas.width = width
    canvas.height = height

    // 1. Background Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height)
    bgGradient.addColorStop(0, '#090d16')
    bgGradient.addColorStop(0.5, '#0f172a')
    bgGradient.addColorStop(1, '#1e1b4b')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)

    // Decorative grid circles
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)'
    ctx.lineWidth = 1
    for (let i = 0; i < width; i += 60) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, height)
      ctx.stroke()
    }
    for (let j = 0; j < height; j += 60) {
      ctx.beginPath()
      ctx.moveTo(0, j)
      ctx.lineTo(width, j)
      ctx.stroke()
    }

    // Outer glow border
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)'
    ctx.lineWidth = 4
    ctx.strokeRect(20, 20, width - 40, height - 40)

    // 2. Header: Logo & Brand
    ctx.fillStyle = '#38bdf8'
    ctx.font = '900 36px Inter, sans-serif'
    ctx.fillText('⚡ RUNSTREAK', 60, 80)

    ctx.fillStyle = '#94a3b8'
    ctx.font = '500 18px Inter, sans-serif'
    ctx.fillText('Gamify Your Running Habit', 60, 110)

    // Top Right Tag
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)'
    ctx.beginPath()
    ctx.roundRect(width - 240, 50, 180, 40, 20)
    ctx.fill()
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.fillStyle = '#38bdf8'
    ctx.font = '700 16px Inter, sans-serif'
    ctx.textAlign = 'center'
    const tagText = variant === 'profile' ? 'PROFILE STATS' : variant === 'badge' ? 'BADGE UNLOCKED' : 'RUN LOGGED'
    ctx.fillText(tagText, width - 150, 76)
    ctx.textAlign = 'left' // reset alignment

    // 3. Variant Specific Content
    if (variant === 'profile' && user) {
      // User Profile Info
      ctx.fillStyle = '#ffffff'
      ctx.font = '800 38px Inter, sans-serif'
      ctx.fillText(user.displayName || user.username, 60, 190)

      ctx.fillStyle = '#94a3b8'
      ctx.font = '500 20px Inter, sans-serif'
      ctx.fillText(`@${user.username} · Member of RunStreak Community`, 60, 225)

      // Stats Grid (4 Boxes)
      const boxes = [
        { label: 'CURRENT STREAK', val: `${user.currentStreak} Days 🔥`, color: '#f97316' },
        { label: 'TOTAL DISTANCE', val: `${Number(user.totalDistanceKm).toFixed(1)} km 🏃`, color: '#38bdf8' },
        { label: 'TOTAL POINTS', val: `${user.totalPoints.toLocaleString()} pts ⚡`, color: '#fbbf24' },
        { label: 'LONGEST STREAK', val: `${user.longestStreak} Days 🏆`, color: '#a855f7' },
      ]

      boxes.forEach((box, idx) => {
        const x = 60 + (idx % 2) * 530
        const y = 260 + Math.floor(idx / 2) * 130
        const w = 500
        const h = 110

        ctx.fillStyle = 'rgba(30, 41, 59, 0.7)'
        ctx.beginPath()
        ctx.roundRect(x, y, w, h, 16)
        ctx.fill()
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)'
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Left accent strip
        ctx.fillStyle = box.color
        ctx.beginPath()
        ctx.roundRect(x + 4, y + 16, 6, h - 32, 3)
        ctx.fill()

        ctx.fillStyle = '#94a3b8'
        ctx.font = '700 14px Inter, sans-serif'
        ctx.fillText(box.label, x + 28, y + 42)

        ctx.fillStyle = '#ffffff'
        ctx.font = '800 32px Inter, sans-serif'
        ctx.fillText(box.val, x + 28, y + 84)
      })
    } else if (variant === 'badge' && badge) {
      // Badge Unlock Card
      ctx.fillStyle = '#a855f7'
      ctx.font = '800 24px Inter, sans-serif'
      ctx.fillText('🏆 ACHIEVEMENT UNLOCKED', 60, 180)

      ctx.fillStyle = '#ffffff'
      ctx.font = '900 48px Inter, sans-serif'
      ctx.fillText(badge.name, 60, 240)

      ctx.fillStyle = '#cbd5e1'
      ctx.font = '500 22px Inter, sans-serif'
      ctx.fillText(badge.description, 60, 285)

      // Badge Details Box
      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)'
      ctx.beginPath()
      ctx.roundRect(60, 320, 1080, 170, 20)
      ctx.fill()
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.fillStyle = '#a855f7'
      ctx.font = '700 20px Inter, sans-serif'
      ctx.fillText(`Rarity: ${badge.rarity.toUpperCase()}`, 100, 375)

      ctx.fillStyle = '#fbbf24'
      ctx.font = '700 20px Inter, sans-serif'
      ctx.fillText(`Reward: +${badge.pointsReward} Points`, 400, 375)

      ctx.fillStyle = '#ffffff'
      ctx.font = '600 20px Inter, sans-serif'
      const runnerName = user?.displayName || user?.username || 'Runner'
      ctx.fillText(`Unlocked by ${runnerName}`, 100, 440)
    } else if (variant === 'run' && run) {
      // Run Completion Card
      ctx.fillStyle = '#ffffff'
      ctx.font = '900 72px Inter, sans-serif'
      const distStr = `${Number(run.distanceKm).toFixed(2)} KM`
      ctx.fillText(distStr, 60, 220)

      ctx.fillStyle = '#38bdf8'
      ctx.font = '700 26px Inter, sans-serif'
      const paceStr = `${Math.floor(run.durationMinutes)} mins · Pace: ${Number(run.paceMinPerKm).toFixed(2)} /km`
      ctx.fillText(paceStr, 60, 265)

      if (challengeName) {
        ctx.fillStyle = '#10b981'
        ctx.font = '700 20px Inter, sans-serif'
        ctx.fillText(`📍 Trail Progress: ${challengeName}`, 60, 305)
      }

      // Stats Banner
      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)'
      ctx.beginPath()
      ctx.roundRect(60, 340, 1080, 150, 20)
      ctx.fill()

      ctx.fillStyle = '#fbbf24'
      ctx.font = '800 36px Inter, sans-serif'
      ctx.fillText(`+${run.pointsEarned} PTS EARNED`, 100, 410)

      ctx.fillStyle = '#cbd5e1'
      ctx.font = '500 20px Inter, sans-serif'
      const dateFormatted = new Date(run.runDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
      ctx.fillText(`Completed on ${dateFormatted}`, 100, 450)
    }

    // 4. Footer & QR Code
    ctx.fillStyle = '#64748b'
    ctx.font = '600 16px Inter, sans-serif'
    ctx.fillText('Scan QR to join & track your runs at runstreak.sheng.nz', 60, 565)

    // Load & draw QR code image from public API
    try {
      const qrImg = new Image()
      qrImg.crossOrigin = 'anonymous'
      qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://runstreak.sheng.nz&color=38bdf8&bgcolor=0f172a'
      await new Promise((resolve) => {
        qrImg.onload = () => {
          ctx.drawImage(qrImg, width - 160, height - 140, 100, 100)
          resolve(true)
        }
        qrImg.onerror = () => resolve(false)
      })
    } catch {
      // QR code fallback if offline
    }

    setIsGenerating(false)
  }, [variant, user, stats, badge, run, challengeName])

  useEffect(() => {
    drawCard()
  }, [drawCard])

  const downloadImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `runstreak-${variant}-${Date.now()}.png`
      link.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  const copyShareText = () => {
    let text = ''
    if (variant === 'profile' && user) {
      text = `🔥 Running on RunStreak! Total Distance: ${Number(user.totalDistanceKm).toFixed(1)}km | Current Streak: ${user.currentStreak} Days | Total Points: ${user.totalPoints}pts. Join me at https://runstreak.sheng.nz`
    } else if (variant === 'badge' && badge) {
      text = `🏆 Just unlocked the "${badge.name}" (${badge.rarity.toUpperCase()}) achievement on RunStreak! Check it out at https://runstreak.sheng.nz`
    } else if (variant === 'run' && run) {
      text = `🏃 Just completed a ${Number(run.distanceKm).toFixed(2)}km run in ${Math.floor(run.durationMinutes)} mins on RunStreak (+${run.pointsEarned} pts)! Track your runs at https://runstreak.sheng.nz`
    } else {
      text = `Check out my achievements on RunStreak: https://runstreak.sheng.nz`
    }

    navigator.clipboard.writeText(text)
  }

  return {
    canvasRef,
    isGenerating,
    downloadImage,
    copyShareText,
    regenerate: drawCard,
  }
}
