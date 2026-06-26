import Tailor from '../models/Tailor.js'
import Review from '../models/Review.js'
import { SORT_MAP, EARLY_BIRD_LIMIT, TAILOR_PROFILE_FORBIDDEN_FIELDS } from '../constants/index.js'

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export async function searchTailors(req, res, next) {
  try {
    const {
      keyword, city, district, state, pincode, specialty,
      featured, topRated, verified,
      page = 1, limit = 12, sort = 'premium',
    } = req.query

    const filter = { isActive: true, status: 'approved' }

    if (keyword)  filter.$text       = { $search: keyword }
    if (city)     filter.city        = { $regex: escapeRegex(city), $options: 'i' }
    if (district) filter.district    = { $regex: escapeRegex(district), $options: 'i' }
    if (state)    filter.state       = { $regex: escapeRegex(state), $options: 'i' }
    if (pincode)  filter.pincode     = pincode
    if (specialty) filter.specialties = { $regex: escapeRegex(specialty), $options: 'i' }
    if (featured  === 'true') filter.subscriptionType = 'premium'
    if (topRated  === 'true') filter.isTopRated = true
    if (verified  === 'true') filter.isVerified = true

    const sortObj = SORT_MAP[sort] || SORT_MAP.premium

    const [tailors, total] = await Promise.all([
      Tailor.find(filter).select('-gallery').sort(sortObj).skip((page - 1) * limit).limit(+limit).lean(),
      Tailor.countDocuments(filter),
    ])
    res.json({ tailors, total, page: +page, pages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
}

export async function getFeatured(req, res, next) {
  try {
    const tailors = await Tailor.find({ isActive: true, status: 'approved', subscriptionType: 'premium' })
      .select('-gallery').sort({ rating: -1 }).limit(8).lean()
    res.json(tailors)
  } catch (err) { next(err) }
}

export async function getTopRated(req, res, next) {
  try {
    const tailors = await Tailor.find({ isActive: true, status: 'approved', isTopRated: true })
      .select('-gallery').sort({ rating: -1 }).limit(8).lean()
    res.json(tailors)
  } catch (err) { next(err) }
}

export async function getPopularCities(req, res, next) {
  try {
    const cities = await Tailor.aggregate([
      { $match: { isActive: true, status: 'approved' } },
      { $group: { _id: '$city', count: { $sum: 1 }, state: { $first: '$state' } } },
      { $sort: { count: -1 } },
      { $limit: 12 },
    ])
    res.json(cities)
  } catch (err) { next(err) }
}

export function getMyProfile(req, res) {
  res.json(req.tailor)
}

export async function getMyReviews(req, res, next) {
  try {
    const { page = 1, limit = 10 } = req.query
    const [reviews, total] = await Promise.all([
      Review.find({ tailor: req.tailor._id })
        .populate('customer', 'fullName profileImage')
        .sort('-createdAt').skip((page - 1) * limit).limit(+limit).lean(),
      Review.countDocuments({ tailor: req.tailor._id }),
    ])
    res.json({ reviews, total, page: +page, pages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
}

export async function getCustomerReviews(req, res, next) {
  try {
    const { page = 1, limit = 10 } = req.query
    const [reviews, total] = await Promise.all([
      Review.find({ customer: req.user._id })
        .populate('tailor', 'shopName profileImage city')
        .sort('-createdAt').skip((page - 1) * limit).limit(+limit).lean(),
      Review.countDocuments({ customer: req.user._id }),
    ])
    res.json({ reviews, total, page: +page, pages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
}

export async function getTailorById(req, res, next) {
  try {
    const tailor = await Tailor.findById(req.params.id).populate('owner', 'fullName email').lean()
    if (!tailor) return res.status(404).json({ message: 'Tailor not found' })
    res.json(tailor)
  } catch (err) { next(err) }
}

export async function createProfile(req, res, next) {
  try {
    const existing = await Tailor.findOne({ owner: req.user._id })
    if (existing) return res.status(409).json({ message: 'Tailor profile already exists' })

    const totalCount = await Tailor.countDocuments()
    const isEarlyBird = totalCount < EARLY_BIRD_LIMIT
    const freeTrialEnds = isEarlyBird
      ? new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000)
      : undefined

    const tailor = await Tailor.create({ ...req.body, owner: req.user._id, status: 'pending', isEarlyBird, freeTrialEnds })
    res.status(201).json(tailor)
  } catch (err) { next(err) }
}

export async function updateProfile(req, res, next) {
  try {
    TAILOR_PROFILE_FORBIDDEN_FIELDS.forEach(f => delete req.body[f])
    const tailor = await Tailor.findOneAndUpdate({ owner: req.user._id }, req.body, { new: true, runValidators: true })
    if (!tailor) return res.status(404).json({ message: 'Tailor profile not found' })
    res.json(tailor)
  } catch (err) { next(err) }
}

export async function getReviews(req, res, next) {
  try {
    const { page = 1, limit = 10 } = req.query
    const [reviews, total] = await Promise.all([
      Review.find({ tailor: req.params.id })
        .populate('customer', 'fullName profileImage')
        .sort('-createdAt').skip((page - 1) * limit).limit(+limit).lean(),
      Review.countDocuments({ tailor: req.params.id }),
    ])
    res.json({ reviews, total, page: +page, pages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
}

export async function postReview(req, res, next) {
  try {
    const tailor = await Tailor.findById(req.params.id).lean()
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
  } catch (err) { next(err) }
}

export async function replyToReview(req, res, next) {
  try {
    const review = await Review.findOneAndUpdate(
      { _id: req.params.reviewId, tailor: req.tailor._id },
      { tailorReply: { text: req.body.text, repliedAt: new Date() } },
      { new: true }
    )
    if (!review) return res.status(404).json({ message: 'Review not found' })
    res.json(review)
  } catch (err) { next(err) }
}
