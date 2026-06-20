import { Router } from 'express'
import User from '../models/User.js'
import Tailor from '../models/Tailor.js'
import { protect } from '../middleware/auth.js'

const router = Router()

// GET /api/favorites
router.get('/', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('favorites', 'shopName ownerName profileImage city district rating reviewCount isVerified subscriptionType')
  res.json(user.favorites)
})

// POST /api/favorites/:tailorId
router.post('/:tailorId', protect, async (req, res) => {
  const tailor = await Tailor.findById(req.params.tailorId)
  if (!tailor) return res.status(404).json({ message: 'Tailor not found' })
  await User.findByIdAndUpdate(req.user._id, { $addToSet: { favorites: req.params.tailorId } })
  res.json({ message: 'Added to favorites' })
})

// DELETE /api/favorites/:tailorId
router.delete('/:tailorId', protect, async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $pull: { favorites: req.params.tailorId } })
  res.json({ message: 'Removed from favorites' })
})

// GET /api/favorites/:tailorId/check
router.get('/:tailorId/check', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('favorites')
  const saved = user.favorites.some(id => id.toString() === req.params.tailorId)
  res.json({ saved })
})

export default router
