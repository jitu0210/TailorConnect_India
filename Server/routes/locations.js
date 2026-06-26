import { Router } from 'express'
import { getStates, getDistricts, getCities, getPincode } from '../controllers/locations.controller.js'

const router = Router()

router.get('/states',    getStates)
router.get('/districts', getDistricts)
router.get('/cities',    getCities)
router.get('/pincode',   getPincode)

export default router
