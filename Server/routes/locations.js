import { Router } from 'express'
import { INDIA_LOCATIONS, getDistricts, getCities } from '../data/indiaLocations.js'

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

export default router
