const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function req(path, opts = {}, token = null) {
  const headers = { 'Content-Type': 'application/json', ...opts.headers }
  if (token) headers.Authorization = `Bearer ${token}`
  const r = await fetch(`${BASE}${path}`, { ...opts, headers })
  const data = await r.json()
  if (!r.ok) throw new Error(data.message || 'Request failed')
  return data
}

export const authApi = {
  register: (body) => req('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => req('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: (token) => req('/auth/me', {}, token),
  updateMe: (body, token) => req('/auth/me', { method: 'PATCH', body: JSON.stringify(body) }, token),
  changePassword: (body, token) => req('/auth/change-password', { method: 'POST', body: JSON.stringify(body) }, token),
}

export const tailorsApi = {
  search: (params) => req(`/tailors?${new URLSearchParams(params)}`),
  featured: () => req('/tailors/featured'),
  topRated: () => req('/tailors/top-rated'),
  popularCities: () => req('/tailors/popular-cities'),
  getById: (id) => req(`/tailors/${id}`),
  getReviews: (id, params) => req(`/tailors/${id}/reviews?${new URLSearchParams(params)}`),
  postReview: (id, body, token) => req(`/tailors/${id}/reviews`, { method: 'POST', body: JSON.stringify(body) }, token),
  replyToReview: (reviewId, text, token) => req(`/tailors/reviews/${reviewId}/reply`, { method: 'POST', body: JSON.stringify({ text }) }, token),
  create: (body, token) => req('/tailors', { method: 'POST', body: JSON.stringify(body) }, token),
  updateMe: (body, token) => req('/tailors/me', { method: 'PATCH', body: JSON.stringify(body) }, token),
  myProfile: (token) => req('/tailors/me/profile', {}, token),
  myReviews: (params, token) => req(`/tailors/me/reviews?${new URLSearchParams(params)}`, {}, token),
  customerReviews: (params, token) => req(`/tailors/customer/my-reviews?${new URLSearchParams(params)}`, {}, token),
}

export const locationsApi = {
  states: () => req('/locations/states'),
  districts: (state) => req(`/locations/districts?state=${encodeURIComponent(state)}`),
  cities: (state, district) => req(`/locations/cities?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`),
}

export const subscriptionsApi = {
  createOrder: (token) => req('/subscriptions/create-order', { method: 'POST' }, token),
  verifyPayment: (body, token) => req('/subscriptions/verify-payment', { method: 'POST', body: JSON.stringify(body) }, token),
  status: (token) => req('/subscriptions/status', {}, token),
  history: (token) => req('/subscriptions/history', {}, token),
}

export const inquiriesApi = {
  send: (body, token) => req('/inquiries', { method: 'POST', body: JSON.stringify(body) }, token),
  mine: (params, token) => req(`/inquiries/mine?${new URLSearchParams(params)}`, {}, token),
  customerInquiries: (params, token) => req(`/inquiries/customer?${new URLSearchParams(params)}`, {}, token),
  markRead: (id, token) => req(`/inquiries/${id}/read`, { method: 'PATCH' }, token),
  unreadCount: (token) => req('/inquiries/unread-count', {}, token),
}

export const favoritesApi = {
  list: (token) => req('/favorites', {}, token),
  add: (tailorId, token) => req(`/favorites/${tailorId}`, { method: 'POST' }, token),
  remove: (tailorId, token) => req(`/favorites/${tailorId}`, { method: 'DELETE' }, token),
  check: (tailorId, token) => req(`/favorites/${tailorId}/check`, {}, token),
}

export const uploadsApi = {
  galleryDelete: (itemId, token) => req(`/uploads/gallery/${itemId}`, { method: 'DELETE' }, token),
}

export const adminApi = {
  analytics: (token) => req('/admin/analytics', {}, token),
  users: (params, token) => req(`/admin/users?${new URLSearchParams(params)}`, {}, token),
  toggleUser: (id, token) => req(`/admin/users/${id}/toggle-active`, { method: 'PATCH' }, token),
  tailors: (params, token) => req(`/admin/tailors?${new URLSearchParams(params)}`, {}, token),
  setTailorStatus: (id, status, token) => req(`/admin/tailors/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, token),
  toggleVerify: (id, token) => req(`/admin/tailors/${id}/verify`, { method: 'PATCH' }, token),
  toggleTopRated: (id, token) => req(`/admin/tailors/${id}/top-rated`, { method: 'PATCH' }, token),
  reviews: (params, token) => req(`/admin/reviews?${new URLSearchParams(params)}`, {}, token),
  deleteReview: (id, token) => req(`/admin/reviews/${id}`, { method: 'DELETE' }, token),
  subscriptions: (params, token) => req(`/admin/subscriptions?${new URLSearchParams(params)}`, {}, token),
}
