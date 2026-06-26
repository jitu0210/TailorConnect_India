import { Router } from 'express'
import { protect, optionalAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'
import { attachTailor } from '../middleware/tailor.js'
import { inquiryLimiter } from '../middleware/rateLimit.js'
import {
  sendInquiry, getMyInquiries, getCustomerInquiries, markRead, getUnreadCount,
} from '../controllers/inquiries.controller.js'

const router = Router()

router.post('/',              inquiryLimiter, optionalAuth, sendInquiry)
router.get( '/mine',          protect, requireRole('tailor'), attachTailor, getMyInquiries)
router.get( '/customer',      protect, requireRole('customer'), getCustomerInquiries)
router.patch('/:id/read',     protect, requireRole('tailor'), attachTailor, markRead)
router.get( '/unread-count',  protect, requireRole('tailor'), attachTailor, getUnreadCount)

export default router
