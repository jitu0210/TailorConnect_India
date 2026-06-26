import { req } from './client.js'

export const locationsApi = {
  states:    ()                 => req('/locations/states'),
  districts: (state)            => req(`/locations/districts?state=${encodeURIComponent(state)}`),
  cities:    (state, district)  => req(`/locations/cities?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`),
}
