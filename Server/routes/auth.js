import { Router } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Tailor from '../models/Tailor.js'
import { protect } from '../middleware/auth.js'

const router = Router()

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' })

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { fullName, email, mobile, password, role = 'customer', state, district, city } = req.body
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'fullName, email and password are required' })
  }
  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) return res.status(409).json({ message: 'Email already registered' })

  const user = await User.create({ fullName, email, mobile, password, role, state, district, city })
  res.status(201).json({ token: signToken(user._id), user: { _id: user._id, fullName: user.fullName, email: user.email, role: user.role } })
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' })
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }
  if (!user.isActive) return res.status(403).json({ message: 'Account suspended' })

  // attach tailor profile id if role is tailor
  let tailorId = null
  if (user.role === 'tailor') {
    const tailor = await Tailor.findOne({ owner: user._id }).select('_id')
    tailorId = tailor?._id || null
  }
  res.json({ token: signToken(user._id), user: { _id: user._id, fullName: user.fullName, email: user.email, role: user.role, tailorId } })
})

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('favorites', 'shopName profileImage city rating reviewCount')
  let tailorProfile = null
  if (user.role === 'tailor') {
    tailorProfile = await Tailor.findOne({ owner: user._id }).select('_id shopName status subscriptionType')
  }
  res.json({ user, tailorProfile })
})

// PATCH /api/auth/me
router.patch('/me', protect, async (req, res) => {
  const allowed = ['fullName', 'mobile', 'state', 'district', 'city']
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k))
  )
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
  res.json(user)
})

// POST /api/auth/change-password
router.post('/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const user = await User.findById(req.user._id).select('+password')
  if (!(await user.matchPassword(currentPassword))) {
    return res.status(400).json({ message: 'Current password is incorrect' })
  }
  user.password = newPassword
  await user.save()
  res.json({ message: 'Password updated' })
})

export default router
