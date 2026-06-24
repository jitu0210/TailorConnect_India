export function errorHandler(err, req, res, next) {
  // Mongoose validation errors → 400 with readable field messages
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message)
    return res.status(400).json({ message: messages.join('. ') })
  }

  // Mongoose duplicate key → 409
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    return res.status(409).json({ message: `A record with this ${field} already exists` })
  }

  // Mongoose bad ObjectId → 404
  if (err.name === 'CastError') {
    return res.status(404).json({ message: 'Resource not found' })
  }

  const status = err.status || err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  if (process.env.NODE_ENV !== 'production') {
    console.error('[errorHandler]', err)
  }

  res.status(status).json({ message })
}
