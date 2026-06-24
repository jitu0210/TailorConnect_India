import { Router } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Tailor from '../models/Tailor.js'
import { protect } from '../middleware/auth.js'
import { sendOtpEmail } from '../utils/email.js'

const router = Router()

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' })

// In-memory OTP stores
const otpStore   = new Map()   // tailor login OTPs
const resetStore = new Map()   // password-reset OTPs

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, mobile, password, role = 'customer', state, district, city, pincode } = req.body
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'fullName, email and password are required' })
    }
    if (role === 'tailor' && !mobile) {
      return res.status(400).json({ message: 'mobile is required for tailor accounts' })
    }
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) return res.status(409).json({ message: 'Email already registered' })

    const user = await User.create({ fullName, email, mobile, password, role, state, district, city, pincode })
    res.status(201).json({ token: signToken(user._id), user: { _id: user._id, fullName: user.fullName, email: user.email, role: user.role } })
  } catch (err) { next(err) }
})

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    if (!user.isActive) return res.status(403).json({ message: 'Account suspended' })

    let tailorId = null
    if (user.role === 'tailor') {
      const tailor = await Tailor.findOne({ owner: user._id }).select('_id')
      tailorId = tailor?._id || null
    }
    res.json({ token: signToken(user._id), user: { _id: user._id, fullName: user.fullName, email: user.email, role: user.role, tailorId } })
  } catch (err) { next(err) }
})

// GET /api/auth/me
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('favorites', 'shopName profileImage city rating reviewCount')
    let tailorProfile = null
    if (user.role === 'tailor') {
      tailorProfile = await Tailor.findOne({ owner: user._id }).select('_id shopName status subscriptionType')
    }
    res.json({ user, tailorProfile })
  } catch (err) { next(err) }
})

// PATCH /api/auth/me
router.patch('/me', protect, async (req, res, next) => {
  try {
    const allowed = ['fullName', 'mobile', 'state', 'district', 'city', 'pincode']
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    )
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
    res.json(user)
  } catch (err) { next(err) }
})

// POST /api/auth/change-password
router.post('/change-password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user._id).select('+password')
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }
    user.password = newPassword
    await user.save()
    res.json({ message: 'Password updated' })
  } catch (err) { next(err) }
})

// POST /api/auth/forgot/send  — send reset OTP to any registered email
router.post('/forgot/send', async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required' })
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return res.status(404).json({ message: 'No account found with that email' })

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    resetStore.set(user.email, { otp, expiresAt: Date.now() + 10 * 60 * 1000, userId: user._id })

    await sendOtpEmail(user.email, otp, 'reset')
    res.json({ sent: true, email: user.email })
  } catch (err) { next(err) }
})

// POST /api/auth/forgot/reset  — verify OTP and set new password
router.post('/forgot/reset', async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body
    if (!email || !otp || !newPassword) return res.status(400).json({ message: 'Email, OTP and new password are required' })
    if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })

    const entry = resetStore.get(email.toLowerCase())
    if (!entry) return res.status(400).json({ message: 'No reset code found. Please request a new one.' })
    if (Date.now() > entry.expiresAt) {
      resetStore.delete(email.toLowerCase())
      return res.status(400).json({ message: 'Code has expired. Please request a new one.' })
    }
    if (entry.otp !== String(otp).trim()) return res.status(400).json({ message: 'Incorrect code' })

    resetStore.delete(email.toLowerCase())
    const user = await User.findById(entry.userId).select('+password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    user.password = newPassword
    await user.save()
    res.json({ message: 'Password updated. You can now sign in.' })
  } catch (err) { next(err) }
})

// POST /api/auth/tailor-otp/send  — verify credentials then email an OTP
router.post('/tailor-otp/send', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    if (!user.isActive) return res.status(403).json({ message: 'Account suspended' })
    if (user.role !== 'tailor') return res.status(403).json({ message: 'This login is for tailor accounts only' })

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    otpStore.set(user.email, { otp, expiresAt: Date.now() + 10 * 60 * 1000, userId: user._id })

    await sendOtpEmail(user.email, otp)
    res.json({ sent: true, email: user.email })
  } catch (err) { next(err) }
})

// POST /api/auth/tailor-otp/verify  — verify OTP and return token
router.post('/tailor-otp/verify', async (req, res, next) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' })

    const entry = otpStore.get(email.toLowerCase())
    if (!entry) return res.status(400).json({ message: 'No OTP found for this email. Please request a new one.' })
    if (Date.now() > entry.expiresAt) {
      otpStore.delete(email.toLowerCase())
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' })
    }
    if (entry.otp !== String(otp).trim()) {
      return res.status(400).json({ message: 'Incorrect OTP' })
    }

    otpStore.delete(email.toLowerCase())
    const user = await User.findById(entry.userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const tailor = await Tailor.findOne({ owner: user._id }).select('_id')
    res.json({
      token: signToken(user._id),
      user: { _id: user._id, fullName: user.fullName, email: user.email, role: user.role, tailorId: tailor?._id || null },
    })
  } catch (err) { next(err) }
})


export default router
