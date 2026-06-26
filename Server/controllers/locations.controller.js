import {
  INDIA_LOCATIONS,
  getDistricts as lookupDistricts,
  getCities as lookupCities,
  getCityPincode,
} from '../data/indiaLocations.js'
import { CACHE_1DAY } from '../constants/index.js'

export function getStates(req, res) {
  res.set('Cache-Control', CACHE_1DAY)
  res.json(INDIA_LOCATIONS.map(s => s.state))
}

export function getDistricts(req, res) {
  const { state } = req.query
  if (!state) return res.status(400).json({ message: 'state query param required' })
  res.set('Cache-Control', CACHE_1DAY)
  res.json(lookupDistricts(state))
}

export function getCities(req, res) {
  const { state, district } = req.query
  if (!state || !district) return res.status(400).json({ message: 'state and district params required' })
  res.set('Cache-Control', CACHE_1DAY)
  res.json(lookupCities(state, district))
}

export function getPincode(req, res) {
  const { state, district, city } = req.query
  if (!state || !district || !city) return res.status(400).json({ message: 'state, district and city are required' })
  res.set('Cache-Control', CACHE_1DAY)
  res.json({ pincode: getCityPincode(state, district, city) })
}
