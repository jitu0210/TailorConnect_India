import { Router } from 'express'
import Inquiry from '../models/Inquiry.js'
import Tailor from '../models/Tailor.js'
import { protect, optionalAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'

const router = Router()

// POST /api/inquiries  (any user, optionally authenticated)
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const { tailorId, customerName, customerEmail, customerMobile, message } = req.body
    if (!tailorId || !customerName || !customerEmail || !message) {
      return res.status(400).json({ message: 'tailorId, customerName, customerEmail, message are required' })
    }
    const tailor = await Tailor.findById(tailorId)
    if (!tailor) return res.status(404).json({ message: 'Tailor not found' })

    const inquiry = await Inquiry.create({
      tailor: tailorId,
      customer: req.user?._id,
      customerName,
      customerEmail,
      customerMobile,
      message,
    })
    res.status(201).json(inquiry)
  } catch (err) { next(err) }
})

// GET /api/inquiries/mine  (tailor: their inbox)
router.get('/mine', protect, requireRole('tailor'), async (req, res, next) => {
  try {
    const tailor = await Tailor.findOne({ owner: req.user._id })
    if (!tailor) return res.status(404).json({ message: 'Tailor profile not found' })
    const { page = 1, limit = 20, unread } = req.query
    const filter = { tailor: tailor._id }
    if (unread === 'true') filter.isRead = false
    const [inquiries, total] = await Promise.all([
      Inquiry.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(+limit),
      Inquiry.countDocuments(filter),
    ])
    res.json({ inquiries, total, page: +page, pages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
})

// GET /api/inquiries/customer  (customer: their sent inquiries)
router.get('/customer', protect, requireRole('customer'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const [inquiries, total] = await Promise.all([
      Inquiry.find({ customer: req.user._id }).populate('tailor', 'shopName profileImage city').sort('-createdAt').skip((page - 1) * limit).limit(+limit),
      Inquiry.countDocuments({ customer: req.user._id }),
    ])
    res.json({ inquiries, total, page: +page, pages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
})

// PATCH /api/inquiries/:id/read  (tailor marks as read)
router.patch('/:id/read', protect, requireRole('tailor'), async (req, res, next) => {
  try {
    const tailor = await Tailor.findOne({ owner: req.user._id })
    if (!tailor) return res.status(404).json({ message: 'Tailor profile not found' })
    const inquiry = await Inquiry.findOneAndUpdate(
      { _id: req.params.id, tailor: tailor._id },
      { isRead: true },
      { new: true }
    )
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' })
    res.json(inquiry)
  } catch (err) { next(err) }
})

// GET /api/inquiries/unread-count  (tailor)
router.get('/unread-count', protect, requireRole('tailor'), async (req, res, next) => {
  try {
    const tailor = await Tailor.findOne({ owner: req.user._id })
    if (!tailor) return res.json({ count: 0 })
    const count = await Inquiry.countDocuments({ tailor: tailor._id, isRead: false })
    res.json({ count })
  } catch (err) { next(err) }
})

export default router
