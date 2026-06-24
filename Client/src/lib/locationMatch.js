// ── Location-based matchmaking utilities ─────────────────────────────────────
// Determines how well a tailor's location matches the user's location.
// Priority: city (exact) > district > state > no match (national).

function cmp(a, b) {
  return Boolean(a && b && a.trim().toLowerCase() === b.trim().toLowerCase())
}

// Returns 0–3: 0 = city match, 1 = district, 2 = state, 3 = no match
export function matchScore(tailor, { city = '', district = '', state = '' } = {}) {
  if (cmp(tailor.city,     city))     return 0
  if (cmp(tailor.district, district)) return 1
  if (cmp(tailor.state,    state))    return 2
  return 3
}

// Sort tailors closest-first; tie-break on rating then reviewCount
export function sortByLocation(tailors, userLoc) {
  if (!userLoc?.city && !userLoc?.district && !userLoc?.state) return tailors
  return [...tailors].sort((a, b) => {
    const diff = matchScore(a, userLoc) - matchScore(b, userLoc)
    if (diff !== 0) return diff
    if (b.rating !== a.rating) return (b.rating || 0) - (a.rating || 0)
    return (b.reviewCount || 0) - (a.reviewCount || 0)
  })
}

// Read user's location from auth user object or localStorage fallback
export function getUserLocation(user) {
  if (user?.city || user?.district || user?.state) {
    return {
      city:     user.city     || '',
      district: user.district || '',
      state:    user.state    || '',
    }
  }
  try {
    const stored = JSON.parse(localStorage.getItem('tc_location') || 'null')
    if (stored?.city || stored?.district || stored?.state) return stored
  } catch { /* ignore */ }
  return { city: '', district: '', state: '' }
}

// Short human-readable scope label, e.g. "Delhi", "NCR district", "Uttar Pradesh"
export function getScopeLabel({ city = '', district = '', state = '' } = {}) {
  if (city)     return city
  if (district) return `${district} district`
  if (state)    return state
  return ''
}

// Which tier a tailor falls into relative to the user's location
export const TIER_LABEL = ['In your city', 'In your district', 'In your state', 'Across India']
