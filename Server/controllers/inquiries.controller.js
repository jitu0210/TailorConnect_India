import Inquiry from '../models/Inquiry.js'
import Tailor from '../models/Tailor.js'

export async function sendInquiry(req, res, next) {
  try {
    const { tailorId, customerName, customerEmail, customerMobile, message } = req.body
    if (!tailorId || !customerName || !customerEmail || !message) {
      return res.status(400).json({ message: 'tailorId, customerName, customerEmail, message are required' })
    }
    const tailor = await Tailor.findById(tailorId).lean()
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
}

export async function getMyInquiries(req, res, next) {
  try {
    const { page = 1, limit = 20, unread } = req.query
    const filter = { tailor: req.tailor._id }
    if (unread === 'true') filter.isRead = false
    const [inquiries, total] = await Promise.all([
      Inquiry.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(+limit).lean(),
      Inquiry.countDocuments(filter),
    ])
    res.json({ inquiries, total, page: +page, pages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
}

export async function getCustomerInquiries(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query
    const [inquiries, total] = await Promise.all([
      Inquiry.find({ customer: req.user._id })
        .populate('tailor', 'shopName profileImage city')
        .sort('-createdAt').skip((page - 1) * limit).limit(+limit).lean(),
      Inquiry.countDocuments({ customer: req.user._id }),
    ])
    res.json({ inquiries, total, page: +page, pages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
}

export async function markRead(req, res, next) {
  try {
    const inquiry = await Inquiry.findOneAndUpdate(
      { _id: req.params.id, tailor: req.tailor._id },
      { isRead: true },
      { new: true }
    )
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' })
    res.json(inquiry)
  } catch (err) { next(err) }
}

export async function getUnreadCount(req, res, next) {
  try {
    const count = await Inquiry.countDocuments({ tailor: req.tailor._id, isRead: false })
    res.json({ count })
  } catch (err) { next(err) }
}
