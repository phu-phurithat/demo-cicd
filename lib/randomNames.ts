const firstNames = [
  'Alex', 'Bailey', 'Casey', 'Dakota', 'Emery', 'Finley', 'Gray', 'Harper',
  'Indigo', 'Jamie', 'Kai', 'Logan', 'Morgan', 'Nova', 'Owen', 'Parker',
  'Quinn', 'River', 'Sage', 'Taylor', 'Utah', 'Vale', 'Wren', 'Xander',
  'Yuki', 'Zion', 'Ash', 'Blaze', 'Cedar', 'Drew', 'Eden', 'Fox'
]

const animals = [
  'Phoenix', 'Dragon', 'Tiger', 'Eagle', 'Falcon', 'Wolf', 'Bear', 'Lynx',
  'Puma', 'Viper', 'Raven', 'Hawk', 'Shark', 'Cobra', 'Panther', 'Jaguar',
  'Otter', 'Badger', 'Squirrel', 'Raccoon', 'Owl', 'Fox', 'Deer', 'Elk'
]

const colors = [
  '#00d9ff', // cyan
  '#00ff88', // green
  '#ff006e', // pink
  '#ffb700', // orange
  '#7c3aed', // violet
  '#06b6d4', // cyan
  '#ec4899', // rose
  '#f59e0b', // amber
  '#06b6d4', // sky
  '#8b5cf6', // purple
  '#14b8a6', // teal
  '#f97316', // orange
  '#06f9ff', // bright cyan
  '#00ff00', // neon green
  '#ff00ff', // magenta
]

export function generateRandomName(): string {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  return `${firstName} ${animal}`
}

export function generateRandomColor(): string {
  return colors[Math.floor(Math.random() * colors.length)]
}

// Generate a deterministic color based on userId to avoid duplicates
export function getColorForUserId(userId: string): string {
  // Create a simple hash from userId
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  
  // Use absolute value and modulo to get color index
  const colorIndex = Math.abs(hash) % colors.length
  return colors[colorIndex]
}

export function getOrGenerateUserName(): string {
  const name = generateRandomName()
  return name
}
