import { req } from './client.js'

export const subscriptionsApi = {
  plans:         ()             => req('/subscriptions/plans'),
  createOrder:   (plan, token)  => req('/subscriptions/create-order',  { method: 'POST', body: JSON.stringify({ plan }) }, token),
  verifyPayment: (body, token)  => req('/subscriptions/verify-payment', { method: 'POST', body: JSON.stringify(body) }, token),
  status:        (token)        => req('/subscriptions/status',  {}, token),
  history:       (token)        => req('/subscriptions/history', {}, token),
}
