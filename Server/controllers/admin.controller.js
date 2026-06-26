import User from '../models/User.js'
import Tailor from '../models/Tailor.js'
import Review from '../models/Review.js'
import Inquiry from '../models/Inquiry.js'
import Subscription from '../models/Subscription.js'

export async function getAnalytics(req, res, next) {
  try {
    const [
      users, tailors, reviews, activeSubscriptions,
      pendingTailors, approvedTailors, rejectedTailors, revenueAgg,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      Tailor.countDocuments(),
      Review.countDocuments(),
      Subscription.countDocuments({ status: 'active' }),
      Tailor.countDocuments({ status: 'pending' }),
      Tailor.countDocuments({ status: 'approved' }),
      Tailor.countDocuments({ status: 'rejected' }),
      Subscription.aggregate([{ $match: { status: 'active' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ])
    res.json({
      users, tailors, reviews, activeSubscriptions,
      pendingTailors, approvedTailors, rejectedTailors,
      revenue: revenueAgg[0]?.total || 0,
    })
  } catch (err) { next(err) }
}

export async function getRecent(req, res, next) {
  try {
    const [recentUsers, recentTailors] = await Promise.all([
      User.find({ role: 'customer' }).select('fullName email createdAt city state').sort('-createdAt').limit(6).lean(),
      Tailor.find().select('shopName city state status createdAt').sort('-createdAt').limit(6).lean(),
    ])
    res.json({ recentUsers, recentTailors })
  } catch (err) { next(err) }
}

export async function getUsers(req, res, next) {
  try {
    const { page = 1, limit = 20, role, search } = req.query
    const filter = {}
    if (role) filter.role = role
    if (search) filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email:    { $regex: search, $options: 'i' } },
    ]
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort('-createdAt').skip((page - 1) * limit).limit(+limit).lean(),
      User.countDocuments(filter),
    ])
    res.json({ users, total, page: +page, pages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
}

export async function toggleUserActive(req, res, next) {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    user.isActive = !user.isActive
    await user.save()
    res.json({ isActive: user.isActive })
  } catch (err) { next(err) }
}

export async function deleteUser(req, res, next) {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' })
    }
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin accounts' })
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
}

export async function getTailors(req, res, next) {
  try {
    const { page = 1, limit = 20, status, search } = req.query
    const filter = {}
    if (status) filter.status = status
    if (search) filter.$or = [
      { shopName: { $regex: search, $options: 'i' } },
      { city:     { $regex: search, $options: 'i' } },
    ]
    const [tailors, total] = await Promise.all([
      Tailor.find(filter).populate('owner', 'fullName email mobile').sort('-createdAt').skip((page - 1) * limit).limit(+limit).lean(),
      Tailor.countDocuments(filter),
    ])
    res.json({ tailors, total, page: +page, pages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
}

export async function setTailorStatus(req, res, next) {
  try {
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
  } catch (err) { next(err) }
}

export async function toggleVerify(req, res, next) {
  try {
    const tailor = await Tailor.findById(req.params.id)
    if (!tailor) return res.status(404).json({ message: 'Tailor not found' })
    tailor.isVerified = !tailor.isVerified
    await tailor.save()
    res.json({ isVerified: tailor.isVerified })
  } catch (err) { next(err) }
}

export async function toggleTopRated(req, res, next) {
  try {
    const tailor = await Tailor.findById(req.params.id)
    if (!tailor) return res.status(404).json({ message: 'Tailor not found' })
    tailor.isTopRated = !tailor.isTopRated
    await tailor.save()
    res.json({ isTopRated: tailor.isTopRated })
  } catch (err) { next(err) }
}

export async function deleteTailor(req, res, next) {
  try {
    const tailor = await Tailor.findByIdAndDelete(req.params.id)
    if (!tailor) return res.status(404).json({ message: 'Tailor not found' })
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
}

export async function getReviews(req, res, next) {
  try {
    const { page = 1, limit = 20, search, rating } = req.query
    const filter = {}
    if (search) filter.$or = [{ customerName: { $regex: search, $options: 'i' } }]
    if (rating) filter.rating = +rating
    const [reviews, total] = await Promise.all([
      Review.find(filter).populate('tailor', 'shopName city').sort('-createdAt').skip((page - 1) * limit).limit(+limit).lean(),
      Review.countDocuments(filter),
    ])
    res.json({ reviews, total, page: +page, pages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
}

export async function deleteReview(req, res, next) {
  try {
    const review = await Review.findByIdAndDelete(req.params.id)
    if (!review) return res.status(404).json({ message: 'Review not found' })
    res.json({ message: 'Review removed' })
  } catch (err) { next(err) }
}

export async function getSubscriptions(req, res, next) {
  try {
    const { page = 1, limit = 20, status } = req.query
    const filter = status ? { status } : {}
    const [subs, total] = await Promise.all([
      Subscription.find(filter).populate('tailor', 'shopName city').sort('-createdAt').skip((page - 1) * limit).limit(+limit).lean(),
      Subscription.countDocuments(filter),
    ])
    res.json({ subs, total, page: +page, pages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
}

export async function getTimeseries(req, res, next) {
  try {
    const { range = 'month' } = req.query
    const now = new Date()
    let from, groupFmt, labelFmt

    if (range === 'today') {
      from = new Date(now); from.setHours(0, 0, 0, 0)
      groupFmt = '%H'; labelFmt = 'hour'
    } else if (range === 'week') {
      from = new Date(now); from.setDate(from.getDate() - 6); from.setHours(0, 0, 0, 0)
      groupFmt = '%Y-%m-%d'; labelFmt = 'day'
    } else if (range === 'month') {
      from = new Date(now); from.setDate(from.getDate() - 29); from.setHours(0, 0, 0, 0)
      groupFmt = '%Y-%m-%d'; labelFmt = 'day'
    } else if (range === 'year') {
      from = new Date(now); from.setFullYear(from.getFullYear() - 1)
      groupFmt = '%Y-%m'; labelFmt = 'month'
    } else if (range === '5years') {
      from = new Date(now); from.setFullYear(from.getFullYear() - 5)
      groupFmt = '%Y-%m'; labelFmt = 'month'
    } else {
      from = new Date('2020-01-01')
      groupFmt = '%Y-%m'; labelFmt = 'month'
    }

    const pipeline = (dateField = 'createdAt', extraMatch = {}) => [
      { $match: { [dateField]: { $gte: from }, ...extraMatch } },
      { $group: { _id: { $dateToString: { format: groupFmt, date: `$${dateField}` } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]

    const [users, tailors, reviews, subscriptions] = await Promise.all([
      User.aggregate(pipeline('createdAt', { role: { $ne: 'admin' } })),
      Tailor.aggregate(pipeline('createdAt')),
      Review.aggregate(pipeline('createdAt')),
      Subscription.aggregate(pipeline('startDate')),
    ])

    const keys = new Set([
      ...users.map(d => d._id),
      ...tailors.map(d => d._id),
      ...reviews.map(d => d._id),
      ...subscriptions.map(d => d._id),
    ])
    const sorted = [...keys].sort()

    const toMap = arr => Object.fromEntries(arr.map(d => [d._id, d.count]))
    const uMap = toMap(users), tMap = toMap(tailors), rMap = toMap(reviews), sMap = toMap(subscriptions)

    const data = sorted.map(k => ({
      label:         k,
      users:         uMap[k] || 0,
      tailors:       tMap[k] || 0,
      reviews:       rMap[k] || 0,
      subscriptions: sMap[k] || 0,
    }))

    res.json({ data, labelFmt })
  } catch (err) { next(err) }
}
