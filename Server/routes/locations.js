import { Router } from 'express'
import { INDIA_LOCATIONS, getDistricts, getCities, getCityPincode } from '../data/indiaLocations.js'

const router = Router()

// GET /api/locations/states
router.get('/states', (req, res) => {
  res.json(INDIA_LOCATIONS.map(s => s.state))
})

// GET /api/locations/districts?state=Maharashtra
router.get('/districts', (req, res) => {
  const { state } = req.query
  if (!state) return res.status(400).json({ message: 'state query param required' })
  res.json(getDistricts(state))
})

// GET /api/locations/cities?state=Maharashtra&district=Pune
router.get('/cities', (req, res) => {
  const { state, district } = req.query
  if (!state || !district) return res.status(400).json({ message: 'state and district params required' })
  res.json(getCities(state, district))
})

// GET /api/locations/pincode?state=...&district=...&city=...
router.get('/pincode', (req, res) => {
  const { state, district, city } = req.query
  if (!state || !district || !city) return res.status(400).json({ message: 'state, district and city are required' })
  res.json({ pincode: getCityPincode(state, district, city) })
})

export default router
