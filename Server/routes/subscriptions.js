import { Router } from 'express'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import Tailor from '../models/Tailor.js'
import Subscription from '../models/Subscription.js'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'
import { sendSubscriptionConfirmation } from '../lib/mailer.js'

const router = Router()

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Prices in INR paise (1 USD ≈ ₹83; amounts rounded to nearest ₹)
const PLANS = {
  monthly:    { label: 'Monthly',   usd: 5,  inrPaise: 41500,  months: 1  },
  semiannual: { label: '6 Months',  usd: 20, inrPaise: 166000, months: 6  },
  annual:     { label: 'Annual',    usd: 35, inrPaise: 290500, months: 12 },
}

// GET /api/subscriptions/plans  (public)
router.get('/plans', (req, res) => res.json(PLANS))

// GET /api/subscriptions/status  (tailor only)
router.get('/status', protect, requireRole('tailor'), async (req, res, next) => {
  try {
    const tailor = await Tailor.findOne({ owner: req.user._id })
      .select('subscriptionType subscriptionPlan subscriptionExpiry isEarlyBird freeTrialEnds isActive')
    if (!tailor) return res.status(404).json({ message: 'Tailor profile not found' })

    const now = new Date()
    const trialActive = tailor.isEarlyBird && tailor.freeTrialEnds && tailor.freeTrialEnds > now
    const paidActive  = tailor.subscriptionType === 'premium' && tailor.subscriptionExpiry && tailor.subscriptionExpiry > now

    const daysUntilTrialEnd = trialActive
      ? Math.ceil((tailor.freeTrialEnds - now) / (1000 * 60 * 60 * 24))
      : null

    res.json({
      plan:              paidActive ? (tailor.subscriptionPlan || 'premium') : (trialActive ? 'trial' : 'free'),
      isActive:          paidActive || trialActive,
      expiryDate:        paidActive ? tailor.subscriptionExpiry : null,
      isEarlyBird:       tailor.isEarlyBird,
      freeTrialEnds:     tailor.freeTrialEnds,
      trialActive,
      daysUntilTrialEnd,
    })
  } catch (err) { next(err) }
})

// POST /api/subscriptions/create-order  (tailor only)
router.post('/create-order', protect, requireRole('tailor'), async (req, res, next) => {
  try {
    const { plan } = req.body
    if (!PLANS[plan]) return res.status(400).json({ message: 'Invalid plan. Choose: monthly, semiannual, or annual' })

    const tailor = await Tailor.findOne({ owner: req.user._id })
    if (!tailor) return res.status(404).json({ message: 'Tailor profile not found' })

    const { inrPaise, label } = PLANS[plan]

    const order = await razorpay.orders.create({
      amount: inrPaise,
      currency: 'INR',
      receipt: `sub_${tailor._id}_${Date.now()}`,
      notes: { tailorId: tailor._id.toString(), userId: req.user._id.toString(), plan },
    })

    await Subscription.create({
      tailor: tailor._id,
      plan,
      razorpayOrderId: order.id,
      amount: inrPaise,
      currency: 'INR',
      status: 'pending',
    })

    res.json({
      orderId:   order.id,
      amount:    inrPaise,
      currency:  'INR',
      keyId:     process.env.RAZORPAY_KEY_ID,
      plan,
      planLabel: label,
      prefill:   { name: req.user.fullName, email: req.user.email, contact: tailor.mobile || '' },
    })
  } catch (err) { next(err) }
})

// POST /api/subscriptions/verify-payment  (tailor only)
router.post('/verify-payment', protect, requireRole('tailor'), async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed — signature mismatch' })
    }

    const sub = await Subscription.findOne({ razorpayOrderId: razorpay_order_id })
    if (!sub) return res.status(404).json({ message: 'Subscription record not found' })

    const plan = PLANS[sub.plan]
    if (!plan) return res.status(400).json({ message: 'Unknown plan in subscription record' })

    const tailor = await Tailor.findById(sub.tailor)
    if (!tailor) return res.status(404).json({ message: 'Tailor not found' })

    const now = new Date()
    const baseDate = (tailor.subscriptionExpiry && tailor.subscriptionExpiry > now)
      ? new Date(tailor.subscriptionExpiry)
      : now
    const expiryDate = new Date(baseDate)
    expiryDate.setMonth(expiryDate.getMonth() + plan.months)

    await Subscription.findByIdAndUpdate(sub._id, {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'active',
      startDate: now,
      expiryDate,
    })

    await Tailor.findByIdAndUpdate(tailor._id, {
      subscriptionType:   'premium',
      subscriptionPlan:   sub.plan,
      subscriptionExpiry: expiryDate,
      isActive:           true,
    })

    try {
      const owner = await User.findById(tailor.owner).select('email fullName')
      if (owner?.email) await sendSubscriptionConfirmation(tailor, owner.email, owner.fullName, sub.plan, expiryDate)
    } catch { /* email failure must not break the payment response */ }

    res.json({ message: 'Subscription activated', plan: sub.plan, expiryDate })
  } catch (err) { next(err) }
})

// GET /api/subscriptions/history  (tailor only)
router.get('/history', protect, requireRole('tailor'), async (req, res, next) => {
  try {
    const tailor = await Tailor.findOne({ owner: req.user._id })
    if (!tailor) return res.status(404).json({ message: 'Tailor profile not found' })
    const subs = await Subscription.find({ tailor: tailor._id }).sort('-createdAt')
    res.json(subs)
  } catch (err) { next(err) }
})

export default router
