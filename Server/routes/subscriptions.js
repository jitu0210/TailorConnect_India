import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'
import { attachTailor } from '../middleware/tailor.js'
import {
  getPlans, getStatus, createOrder, verifyPayment, getHistory,
} from '../controllers/subscriptions.controller.js'

const router = Router()

router.get( '/plans',          getPlans)
router.get( '/status',         protect, requireRole('tailor'), attachTailor, getStatus)
router.post('/create-order',   protect, requireRole('tailor'), attachTailor, createOrder)
router.post('/verify-payment', protect, requireRole('tailor'), verifyPayment)
router.get( '/history',        protect, requireRole('tailor'), attachTailor, getHistory)

export default router
