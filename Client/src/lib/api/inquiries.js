import { req } from './client.js'

export const inquiriesApi = {
  send:              (body, token)   => req('/inquiries',              { method: 'POST', body: JSON.stringify(body) }, token),
  mine:              (params, token) => req(`/inquiries/mine?${new URLSearchParams(params)}`,     {}, token),
  customerInquiries: (params, token) => req(`/inquiries/customer?${new URLSearchParams(params)}`, {}, token),
  markRead:          (id, token)     => req(`/inquiries/${id}/read`,   { method: 'PATCH' },          token),
  unreadCount:       (token)         => req('/inquiries/unread-count', {},                           token),
}
