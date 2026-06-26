// Barrel re-export — all API modules available from a single import path.
// Domain-specific files live in lib/api/*.js
export { authApi }          from './api/auth.js'
export { tailorsApi }       from './api/tailors.js'
export { locationsApi }     from './api/locations.js'
export { uploadsApi }       from './api/uploads.js'
export { subscriptionsApi } from './api/subscriptions.js'
export { inquiriesApi }     from './api/inquiries.js'
export { favoritesApi }     from './api/favorites.js'
export { adminApi }         from './api/admin.js'
