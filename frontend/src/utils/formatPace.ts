/**
 * Formats a decimal pace (minutes/km) into the standard runner notation "M:SS/km".
 *
 * Why this matters: 5.2 min/km means 5 min 12 sec/km, NOT 5 min 20 sec/km.
 * Displaying it as "5.20" creates a common and confusing misread.
 *
 * @param paceMinPerKm - Raw pace in decimal minutes per km (e.g. 5.2)
 * @returns Formatted string like "5:12/km", or "—" if input is invalid
 */
export function formatPace(paceMinPerKm: number | null | undefined): string {
  if (!paceMinPerKm || paceMinPerKm <= 0 || !isFinite(paceMinPerKm)) return '—'
  const minutes = Math.floor(paceMinPerKm)
  const seconds = Math.round((paceMinPerKm - minutes) * 60)
  // Handle rounding edge case: 59.5s rounds to 60s → carry to next minute
  if (seconds === 60) {
    return `${minutes + 1}:00/km`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}/km`
}

/**
 * Formats total duration in decimal minutes into a human-readable string.
 * E.g. 65.5 → "1h 05m 30s", 26.2 → "26m 12s"
 */
export function formatDuration(durationMinutes: number | null | undefined): string {
  if (!durationMinutes || durationMinutes <= 0) return '—'
  const totalSeconds = Math.round(durationMinutes * 60)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
  }
  if (seconds > 0) {
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
  }
  return `${minutes}m`
}
