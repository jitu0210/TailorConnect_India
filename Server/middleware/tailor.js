import Tailor from '../models/Tailor.js'

export const attachTailor = async (req, res, next) => {
  try {
    const tailor = await Tailor.findOne({ owner: req.user._id }).lean()
    if (!tailor) return res.status(404).json({ message: 'Tailor profile not found' })
    req.tailor = tailor
    next()
  } catch (err) { next(err) }
}
