export interface Location {
  lat: number
  lon: number
  weight?: number
}

export interface MoodType {
  value: 'chill' | 'foodie' | 'adventurous'
  label: string
}

export interface SREConfig {
  locations: Location[]
  mood: MoodType['value']
  activityType: 'restaurant' | 'movie' | 'trip'
}

export interface AggregateLocationScore {
  id: string
  name: string
  score: number
  proximityScore: number
  ratingScore: number
  moodScore: number
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

function calculateCentroid(locations: Location[]): { lat: number; lon: number } {
  if (locations.length === 0) {
    throw new Error('No locations provided')
  }

  let x = 0
  let y = 0
  let z = 0
  let totalWeight = 0

  for (const location of locations) {
    const weight = location.weight || 1
    const latRad = toRadians(location.lat)
    const lonRad = toRadians(location.lon)

    x += Math.cos(latRad) * Math.cos(lonRad) * weight
    y += Math.cos(latRad) * Math.sin(lonRad) * weight
    z += Math.sin(latRad) * weight
    totalWeight += weight
  }

  x /= totalWeight
  y /= totalWeight
  z /= totalWeight

  const lonRad = Math.atan2(y, x)
  const hyp = Math.sqrt(x * x + y * y)
  const latRad = Math.atan2(z, hyp)

  return {
    lat: latRad * (180 / Math.PI),
    lon: lonRad * (180 / Math.PI),
  }
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function calculateWeightedCentroid(
  locations: Location[],
  initiatorIndex?: number
): { lat: number; lon: number } {
  const weightedLocations = locations.map((loc, index) => ({
    ...loc,
    weight: index === initiatorIndex ? 1.5 : loc.weight || 1,
  }))

  return calculateCentroid(weightedLocations)
}

export function calculateAggregateScore(
  centroid: { lat: number; lon: number },
  place: {
    lat: number
    lon: number
    rating?: number
    types?: string[]
  },
  config: Pick<SREConfig, 'mood'>
): number {
  const W_PROXIMITY = 0.4
  const W_RATING = 0.3
  const W_MOOD = 0.3

  const distance = calculateDistance(
    centroid.lat,
    centroid.lon,
    place.lat,
    place.lon
  )
  const maxDistance = 50
  const proximityScore = Math.max(0, 1 - distance / maxDistance)

  const ratingScore = (place.rating || 3.5) / 5

  let moodScore = 0.5
  if (place.types) {
    const moodTypeMap: Record<MoodType['value'], string[]> = {
      foodie: ['restaurant', 'cafe', 'food', 'meal_takeaway'],
      adventurous: ['park', 'museum', 'tourist_attraction', 'amusement_park'],
      chill: ['cafe', 'bar', 'library', 'spa'],
    }

    const relevantTypes = moodTypeMap[config.mood] || []
    const matchCount = place.types.filter((t) =>
      relevantTypes.some((rt) => t.includes(rt))
    ).length
    moodScore = Math.min(1, matchCount / 2)
  }

  return (
    W_PROXIMITY * proximityScore +
    W_RATING * ratingScore +
    W_MOOD * moodScore
  )
}

export async function generateSmartRecommendations(
  config: SREConfig
): Promise<AggregateLocationScore[]> {
  const centroid = calculateWeightedCentroid(config.locations)

  return []
}
