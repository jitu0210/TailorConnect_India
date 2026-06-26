import { req } from './client.js'

export const favoritesApi = {
  list:   (token)           => req('/favorites',              {},                   token),
  add:    (tailorId, token) => req(`/favorites/${tailorId}`,  { method: 'POST' },  token),
  remove: (tailorId, token) => req(`/favorites/${tailorId}`,  { method: 'DELETE' }, token),
  check:  (tailorId, token) => req(`/favorites/${tailorId}/check`, {},              token),
}
