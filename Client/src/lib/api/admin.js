import { req } from './client.js'

export const adminApi = {
  analytics:       (token)              => req('/admin/analytics',  {}, token),
  recent:          (token)              => req('/admin/recent',     {}, token),
  users:           (params, token)      => req(`/admin/users?${new URLSearchParams(params)}`,         {}, token),
  toggleUser:      (id, token)          => req(`/admin/users/${id}/toggle-active`,                    { method: 'PATCH' }, token),
  deleteUser:      (id, token)          => req(`/admin/users/${id}`,                                  { method: 'DELETE' }, token),
  tailors:         (params, token)      => req(`/admin/tailors?${new URLSearchParams(params)}`,       {}, token),
  setTailorStatus: (id, status, token)  => req(`/admin/tailors/${id}/status`,  { method: 'PATCH', body: JSON.stringify({ status }) }, token),
  toggleVerify:    (id, token)          => req(`/admin/tailors/${id}/verify`,   { method: 'PATCH' }, token),
  toggleTopRated:  (id, token)          => req(`/admin/tailors/${id}/top-rated`,{ method: 'PATCH' }, token),
  deleteTailor:    (id, token)          => req(`/admin/tailors/${id}`,          { method: 'DELETE' }, token),
  reviews:         (params, token)      => req(`/admin/reviews?${new URLSearchParams(params)}`,       {}, token),
  deleteReview:    (id, token)          => req(`/admin/reviews/${id}`,          { method: 'DELETE' }, token),
  subscriptions:   (params, token)      => req(`/admin/subscriptions?${new URLSearchParams(params)}`, {}, token),
  timeseries:      (range, token)       => req(`/admin/timeseries?range=${range}`, {}, token),
}
