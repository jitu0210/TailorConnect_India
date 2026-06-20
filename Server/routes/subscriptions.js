import { Router } from 'express'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import Tailor from '../models/Tailor.js'
import Subscription from '../models/Subscription.js'
import { protect } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'

const router = Router()

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

const PREMIUM_AMOUNT = 99900 // ₹999 in paise
const PREMIUM_MONTHS = 1

// POST /api/subscriptions/create-order  (tailor only)
router.post('/create-order', protect, requireRole('tailor'), async (req, res) => {
  const tailor = await Tailor.findOne({ owner: req.user._id })
  if (!tailor) return res.status(404).json({ message: 'Tailor profile not found' })

  const order = await razorpay.orders.create({
    amount: PREMIUM_AMOUNT,
    currency: 'INR',
    receipt: `sub_${tailor._id}_${Date.now()}`,
    notes: { tailorId: tailor._id.toString(), userId: req.user._id.toString() },
  })

  const sub = await Subscription.create({
    tailor: tailor._id,
    plan: 'premium',
    razorpayOrderId: order.id,
    amount: PREMIUM_AMOUNT,
    status: 'pending',
  })

  res.json({
    orderId: order.id,
    amount: PREMIUM_AMOUNT,
    currency: 'INR',
    keyId: process.env.RAZORPAY_KEY_ID,
    subscriptionId: sub._id,
    prefill: { name: req.user.fullName, email: req.user.email, contact: req.user.mobile || '' },
  })
})

// POST /api/subscriptions/verify-payment
router.post('/verify-payment', protect, requireRole('tailor'), async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expected !== razorpay_signature) {
    return res.status(400).json({ message: 'Payment verification failed' })
  }

  const startDate = new Date()
  const expiryDate = new Date(startDate)
  expiryDate.setMonth(expiryDate.getMonth() + PREMIUM_MONTHS)

  const sub = await Subscription.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, status: 'active', startDate, expiryDate },
    { new: true }
  )
  if (!sub) return res.status(404).json({ message: 'Subscription not found' })

  await Tailor.findByIdAndUpdate(sub.tailor, {
    subscriptionType: 'premium',
    subscriptionExpiry: expiryDate,
  })

  res.json({ message: 'Premium activated', expiryDate })
})

// GET /api/subscriptions/status  (tailor only)
router.get('/status', protect, requireRole('tailor'), async (req, res) => {
  const tailor = await Tailor.findOne({ owner: req.user._id }).select('subscriptionType subscriptionExpiry')
  if (!tailor) return res.status(404).json({ message: 'Tailor profile not found' })

  const now = new Date()
  if (tailor.subscriptionType === 'premium' && tailor.subscriptionExpiry < now) {
    await Tailor.findByIdAndUpdate(tailor._id, { subscriptionType: 'free', subscriptionExpiry: null })
    return res.json({ plan: 'free', isActive: false })
  }

  res.json({
    plan: tailor.subscriptionType,
    isActive: tailor.subscriptionType === 'premium' && tailor.subscriptionExpiry > now,
    expiryDate: tailor.subscriptionExpiry,
  })
})

// GET /api/subscriptions/history  (tailor only)
router.get('/history', protect, requireRole('tailor'), async (req, res) => {
  const tailor = await Tailor.findOne({ owner: req.user._id })
  if (!tailor) return res.status(404).json({ message: 'Tailor profile not found' })
  const subs = await Subscription.find({ tailor: tailor._id }).sort('-createdAt')
  res.json(subs)
})

export default router
