import { req } from './client.js'

export const tailorsApi = {
  search:          (params)                => req(`/tailors?${new URLSearchParams(params)}`),
  featured:        ()                      => req('/tailors/featured'),
  topRated:        ()                      => req('/tailors/top-rated'),
  popularCities:   ()                      => req('/tailors/popular-cities'),
  getById:         (id)                    => req(`/tailors/${id}`),
  getReviews:      (id, params = {})       => req(`/tailors/${id}/reviews?${new URLSearchParams(params)}`),
  postReview:      (id, body, token)       => req(`/tailors/${id}/reviews`,         { method: 'POST', body: JSON.stringify(body) }, token),
  replyToReview:   (reviewId, text, token) => req(`/tailors/reviews/${reviewId}/reply`, { method: 'POST', body: JSON.stringify({ text }) }, token),
  create:          (body, token)           => req('/tailors',        { method: 'POST',  body: JSON.stringify(body) }, token),
  updateMe:        (body, token)           => req('/tailors/me',     { method: 'PATCH', body: JSON.stringify(body) }, token),
  myProfile:       (token)                 => req('/tailors/me/profile', {},                                          token),
  myReviews:       (params, token)         => req(`/tailors/me/reviews?${new URLSearchParams(params)}`, {},           token),
  customerReviews: (params, token)         => req(`/tailors/customer/my-reviews?${new URLSearchParams(params)}`, {}, token),
}
