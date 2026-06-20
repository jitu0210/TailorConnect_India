import { Router } from 'express'
import Tailor from '../models/Tailor.js'
import Review from '../models/Review.js'
import { protect, optionalAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'

const router = Router()

// ── Public: Search & Browse ───────────────────────────────────────────────

// GET /api/tailors
router.get('/', async (req, res) => {
  const {
    keyword, city, district, state, pincode, specialty,
    featured, topRated, verified,
    page = 1, limit = 12, sort = 'premium',
  } = req.query

  const filter = { isActive: true, status: 'approved' }

  if (keyword) filter.$text = { $search: keyword }
  if (city) filter.city = { $regex: city, $options: 'i' }
  if (district) filter.district = { $regex: district, $options: 'i' }
  if (state) filter.state = { $regex: state, $options: 'i' }
  if (pincode) filter.pincode = pincode
  if (specialty) filter.specialties = { $regex: specialty, $options: 'i' }
  if (featured === 'true') filter.subscriptionType = 'premium'
  if (topRated === 'true') filter.isTopRated = true
  if (verified === 'true') filter.isVerified = true

  const sortMap = {
    premium: { subscriptionType: -1, rating: -1 },
    rating: { rating: -1, reviewCount: -1 },
    newest: { createdAt: -1 },
  }
  const sortObj = sortMap[sort] || sortMap.premium

  const [tailors, total] = await Promise.all([
    Tailor.find(filter).select('-gallery').sort(sortObj).skip((page - 1) * limit).limit(+limit),
    Tailor.countDocuments(filter),
  ])
  res.json({ tailors, total, page: +page, pages: Math.ceil(total / limit) })
})

// GET /api/tailors/featured
router.get('/featured', async (req, res) => {
  const tailors = await Tailor.find({ isActive: true, status: 'approved', subscriptionType: 'premium' })
    .select('-gallery').sort({ rating: -1 }).limit(8)
  res.json(tailors)
})

// GET /api/tailors/top-rated
router.get('/top-rated', async (req, res) => {
  const tailors = await Tailor.find({ isActive: true, status: 'approved', isTopRated: true })
    .select('-gallery').sort({ rating: -1 }).limit(8)
  res.json(tailors)
})

// GET /api/tailors/popular-cities
router.get('/popular-cities', async (req, res) => {
  const cities = await Tailor.aggregate([
    { $match: { isActive: true, status: 'approved' } },
    { $group: { _id: '$city', count: { $sum: 1 }, state: { $first: '$state' } } },
    { $sort: { count: -1 } },
    { $limit: 12 },
  ])
  res.json(cities)
})

// GET /api/tailors/me/profile  (tailor dashboard — must be before /:id)
router.get('/me/profile', protect, requireRole('tailor'), async (req, res) => {
  const tailor = await Tailor.findOne({ owner: req.user._id })
  if (!tailor) return res.status(404).json({ message: 'Tailor profile not found' })
  res.json(tailor)
})

// GET /api/tailors/me/reviews  (tailor's own reviews for dashboard)
router.get('/me/reviews', protect, requireRole('tailor'), async (req, res) => {
  const tailor = await Tailor.findOne({ owner: req.user._id })
  if (!tailor) return res.status(404).json({ message: 'Tailor profile not found' })
  const { page = 1, limit = 10 } = req.query
  const [reviews, total] = await Promise.all([
    Review.find({ tailor: tailor._id }).populate('customer', 'fullName profileImage').sort('-createdAt').skip((page - 1) * limit).limit(+limit),
    Review.countDocuments({ tailor: tailor._id }),
  ])
  res.json({ reviews, total, page: +page, pages: Math.ceil(total / limit) })
})

// GET /api/tailors/customer/my-reviews  (customer reviews they wrote)
router.get('/customer/my-reviews', protect, requireRole('customer'), async (req, res) => {
  const { page = 1, limit = 10 } = req.query
  const [reviews, total] = await Promise.all([
    Review.find({ customer: req.user._id }).populate('tailor', 'shopName profileImage city').sort('-createdAt').skip((page - 1) * limit).limit(+limit),
    Review.countDocuments({ customer: req.user._id }),
  ])
  res.json({ reviews, total, page: +page, pages: Math.ceil(total / limit) })
})

// GET /api/tailors/:id
router.get('/:id', optionalAuth, async (req, res) => {
  const tailor = await Tailor.findById(req.params.id).populate('owner', 'fullName email')
  if (!tailor) return res.status(404).json({ message: 'Tailor not found' })
  res.json(tailor)
})

// ── Tailor Registration & Profile ─────────────────────────────────────────

// POST /api/tailors  (tailor role only)
router.post('/', protect, requireRole('tailor'), async (req, res) => {
  const existing = await Tailor.findOne({ owner: req.user._id })
  if (existing) return res.status(409).json({ message: 'Tailor profile already exists' })
  const tailor = await Tailor.create({ ...req.body, owner: req.user._id, status: 'pending' })
  res.status(201).json(tailor)
})

// PATCH /api/tailors/me  (tailor updates own profile)
router.patch('/me', protect, requireRole('tailor'), async (req, res) => {
  const forbidden = ['owner', 'isVerified', 'isTopRated', 'status', 'subscriptionType', 'subscriptionExpiry', 'rating', 'reviewCount']
  forbidden.forEach(f => delete req.body[f])
  const tailor = await Tailor.findOneAndUpdate({ owner: req.user._id }, req.body, { new: true, runValidators: true })
  if (!tailor) return res.status(404).json({ message: 'Tailor profile not found' })
  res.json(tailor)
})

// ── Reviews ───────────────────────────────────────────────────────────────

// GET /api/tailors/:id/reviews
router.get('/:id/reviews', async (req, res) => {
  const { page = 1, limit = 10 } = req.query
  const [reviews, total] = await Promise.all([
    Review.find({ tailor: req.params.id }).populate('customer', 'fullName profileImage').sort('-createdAt').skip((page - 1) * limit).limit(+limit),
    Review.countDocuments({ tailor: req.params.id }),
  ])
  res.json({ reviews, total, page: +page, pages: Math.ceil(total / limit) })
})

// POST /api/tailors/:id/reviews
router.post('/:id/reviews', protect, async (req, res) => {
  const tailor = await Tailor.findById(req.params.id)
  if (!tailor) return res.status(404).json({ message: 'Tailor not found' })

  const existing = await Review.findOne({ tailor: req.params.id, customer: req.user._id })
  if (existing) return res.status(409).json({ message: 'You have already reviewed this tailor' })

  const review = await Review.create({
    tailor: req.params.id,
    customer: req.user._id,
    customerName: req.user.fullName,
    ...req.body,
  })
  res.status(201).json(review)
})

// POST /api/tailors/reviews/:reviewId/reply  (tailor replies to a review)
router.post('/reviews/:reviewId/reply', protect, requireRole('tailor'), async (req, res) => {
  const tailor = await Tailor.findOne({ owner: req.user._id })
  if (!tailor) return res.status(404).json({ message: 'Tailor profile not found' })

  const review = await Review.findOneAndUpdate(
    { _id: req.params.reviewId, tailor: tailor._id },
    { tailorReply: { text: req.body.text, repliedAt: new Date() } },
    { new: true }
  )
  if (!review) return res.status(404).json({ message: 'Review not found' })
  res.json(review)
})

export default router
