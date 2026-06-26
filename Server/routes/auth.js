import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { authLimiter, otpLimiter } from '../middleware/rateLimit.js'
import {
  register, login, getMe, updateMe, changePassword,
  forgotSend, forgotReset,
  tailorOtpSend, tailorOtpVerify,
} from '../controllers/auth.controller.js'

const router = Router()

router.post('/register',          authLimiter, register)
router.post('/login',             authLimiter, login)
router.get( '/me',                protect,     getMe)
router.patch('/me',               protect,     updateMe)
router.post('/change-password',   protect,     changePassword)
router.post('/forgot/send',       otpLimiter,  forgotSend)
router.post('/forgot/reset',                   forgotReset)
router.post('/tailor-otp/send',   otpLimiter,  tailorOtpSend)
router.post('/tailor-otp/verify', otpLimiter,  tailorOtpVerify)

export default router
