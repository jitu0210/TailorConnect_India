import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorised — no token' })
    }
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')
    if (!req.user) return res.status(401).json({ message: 'User not found' })
    next()
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token — please log in again' })
    }
    next(err)
  }
}

export const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization
    if (header?.startsWith('Bearer ')) {
      const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select('-password')
    }
  } catch { /* token absent or invalid — continue as guest */ }
  next()
}
