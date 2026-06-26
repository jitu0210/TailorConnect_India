import User from '../models/User.js'
import Tailor from '../models/Tailor.js'
import { FAVORITES_MAX } from '../constants/index.js'

export async function listFavorites(req, res, next) {
  try {
    const user = await User.findById(req.user._id).populate(
      'favorites',
      'shopName ownerName profileImage city district rating reviewCount isVerified subscriptionType'
    )
    res.json(user.favorites)
  } catch (err) { next(err) }
}

export async function addFavorite(req, res, next) {
  try {
    const tailor = await Tailor.findById(req.params.tailorId)
    if (!tailor) return res.status(404).json({ message: 'Tailor not found' })
    const user = await User.findById(req.user._id).select('favorites')
    if (user.favorites.length >= FAVORITES_MAX) {
      return res.status(400).json({ message: `Favorites list is full (max ${FAVORITES_MAX})` })
    }
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { favorites: req.params.tailorId } })
    res.json({ message: 'Added to favorites' })
  } catch (err) { next(err) }
}

export async function removeFavorite(req, res, next) {
  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { favorites: req.params.tailorId } })
    res.json({ message: 'Removed from favorites' })
  } catch (err) { next(err) }
}

export async function checkFavorite(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select('favorites')
    const saved = user.favorites.some(id => id.toString() === req.params.tailorId)
    res.json({ saved })
  } catch (err) { next(err) }
}
