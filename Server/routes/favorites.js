import { Router } from 'express'
import User from '../models/User.js'
import Tailor from '../models/Tailor.js'
import { protect } from '../middleware/auth.js'

const router = Router()

// GET /api/favorites
router.get('/', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites', 'shopName ownerName profileImage city district rating reviewCount isVerified subscriptionType')
    res.json(user.favorites)
  } catch (err) { next(err) }
})

// POST /api/favorites/:tailorId
router.post('/:tailorId', protect, async (req, res, next) => {
  try {
    const tailor = await Tailor.findById(req.params.tailorId)
    if (!tailor) return res.status(404).json({ message: 'Tailor not found' })
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { favorites: req.params.tailorId } })
    res.json({ message: 'Added to favorites' })
  } catch (err) { next(err) }
})

// DELETE /api/favorites/:tailorId
router.delete('/:tailorId', protect, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { favorites: req.params.tailorId } })
    res.json({ message: 'Removed from favorites' })
  } catch (err) { next(err) }
})

// GET /api/favorites/:tailorId/check
router.get('/:tailorId/check', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('favorites')
    const saved = user.favorites.some(id => id.toString() === req.params.tailorId)
    res.json({ saved })
  } catch (err) { next(err) }
})

export default router
