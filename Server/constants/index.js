export const PLANS = {
  monthly:    { label: 'Monthly',  usd: 5,  inrPaise: 41500,  months: 1  },
  semiannual: { label: '6 Months', usd: 20, inrPaise: 166000, months: 6  },
  annual:     { label: 'Annual',   usd: 35, inrPaise: 290500, months: 12 },
}

export const FAVORITES_MAX  = 100
export const EARLY_BIRD_LIMIT = 100
export const CACHE_1DAY     = 'public, max-age=86400, stale-while-revalidate=3600'

export const SORT_MAP = {
  premium: { subscriptionType: -1, rating: -1 },
  rating:  { rating: -1, reviewCount: -1 },
  newest:  { createdAt: -1 },
}

export const TAILOR_PROFILE_FORBIDDEN_FIELDS = [
  'owner', 'isVerified', 'isTopRated', 'status', 'isActive',
  'subscriptionType', 'subscriptionExpiry', 'isEarlyBird',
  'freeTrialEnds', 'trialReminderSent', 'rating', 'reviewCount',
]
