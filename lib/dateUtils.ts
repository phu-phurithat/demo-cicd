/**
 * Get today's date in the user's local timezone as YYYY-MM-DD format
 */
export function getTodayLocalDate(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format a date string to user's local timezone display
 */
export function formatDateWithTimezone(dateString?: string): string {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })
}

/**
 * Get user's timezone name
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Get date input value for HTML date input (local timezone)
 */
export function getDateInputValue(date?: string): string {
  if (!date) return ''
  // If it's already in ISO format with time, extract just the date part
  return date.split('T')[0]
}
