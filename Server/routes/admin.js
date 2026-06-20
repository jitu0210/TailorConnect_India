import { Router } from 'express'
import User from '../models/User.js'
import Tailor from '../models/Tailor.js'
import Review from '../models/Review.js'
import Inquiry from '../models/Inquiry.js'
import Subscription from '../models/Subscription.js'
import { protect } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'

const router = Router()
router.use(protect, requireRole('admin'))

// ── Analytics ─────────────────────────────────────────────────────────────
router.get('/analytics', async (req, res) => {
  const [users, tailors, reviews, activeSubscriptions, pendingTailors] = await Promise.all([
    User.countDocuments(),
    Tailor.countDocuments(),
    Review.countDocuments(),
    Subscription.countDocuments({ status: 'active' }),
    Tailor.countDocuments({ status: 'pending' }),
  ])
  res.json({ users, tailors, reviews, activeSubscriptions, pendingTailors })
})

// ── User Management ───────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query
  const filter = {}
  if (role) filter.role = role
  if (search) filter.$or = [
    { fullName: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ]
  const [users, total] = await Promise.all([
    User.find(filter).select('-password').sort('-createdAt').skip((page - 1) * limit).limit(+limit),
    User.countDocuments(filter),
  ])
  res.json({ users, total, page: +page, pages: Math.ceil(total / limit) })
})

router.patch('/users/:id/toggle-active', async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  user.isActive = !user.isActive
  await user.save()
  res.json({ isActive: user.isActive })
})

// ── Tailor Verification ───────────────────────────────────────────────────
router.get('/tailors', async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query
  const filter = {}
  if (status) filter.status = status
  if (search) filter.$or = [
    { shopName: { $regex: search, $options: 'i' } },
    { city: { $regex: search, $options: 'i' } },
  ]
  const [tailors, total] = await Promise.all([
    Tailor.find(filter).populate('owner', 'fullName email mobile').sort('-createdAt').skip((page - 1) * limit).limit(+limit),
    Tailor.countDocuments(filter),
  ])
  res.json({ tailors, total, page: +page, pages: Math.ceil(total / limit) })
})

router.patch('/tailors/:id/status', async (req, res) => {
  const { status } = req.body
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' })
  }
  const tailor = await Tailor.findByIdAndUpdate(
    req.params.id,
    { status, isActive: status === 'approved' },
    { new: true }
  )
  if (!tailor) return res.status(404).json({ message: 'Tailor not found' })
  res.json(tailor)
})

router.patch('/tailors/:id/verify', async (req, res) => {
  const tailor = await Tailor.findById(req.params.id)
  if (!tailor) return res.status(404).json({ message: 'Tailor not found' })
  tailor.isVerified = !tailor.isVerified
  await tailor.save()
  res.json({ isVerified: tailor.isVerified })
})

router.patch('/tailors/:id/top-rated', async (req, res) => {
  const tailor = await Tailor.findById(req.params.id)
  if (!tailor) return res.status(404).json({ message: 'Tailor not found' })
  tailor.isTopRated = !tailor.isTopRated
  await tailor.save()
  res.json({ isTopRated: tailor.isTopRated })
})

// ── Review Moderation ─────────────────────────────────────────────────────
router.get('/reviews', async (req, res) => {
  const { page = 1, limit = 20 } = req.query
  const [reviews, total] = await Promise.all([
    Review.find().populate('tailor', 'shopName city').sort('-createdAt').skip((page - 1) * limit).limit(+limit),
    Review.countDocuments(),
  ])
  res.json({ reviews, total, page: +page, pages: Math.ceil(total / limit) })
})

router.delete('/reviews/:id', async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id)
  if (!review) return res.status(404).json({ message: 'Review not found' })
  res.json({ message: 'Review removed' })
})

// ── Subscriptions ─────────────────────────────────────────────────────────
router.get('/subscriptions', async (req, res) => {
  const { page = 1, limit = 20, status } = req.query
  const filter = status ? { status } : {}
  const [subs, total] = await Promise.all([
    Subscription.find(filter).populate('tailor', 'shopName city').sort('-createdAt').skip((page - 1) * limit).limit(+limit),
    Subscription.countDocuments(filter),
  ])
  res.json({ subs, total, page: +page, pages: Math.ceil(total / limit) })
})

export default router
