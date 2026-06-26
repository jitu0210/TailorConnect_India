import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { connectDB } from './config/db.js'
import tailorsRouter from './routes/tailors.js'
import authRouter from './routes/auth.js'
import locationsRouter from './routes/locations.js'
import subscriptionsRouter from './routes/subscriptions.js'
import inquiriesRouter from './routes/inquiries.js'
import favoritesRouter from './routes/favorites.js'
import uploadsRouter from './routes/uploads.js'
import adminRouter from './routes/admin.js'
import { errorHandler } from './middleware/errorHandler.js'
import { startSubscriptionCron } from './jobs/subscriptionCron.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '50kb' }))

app.use('/api/auth', authRouter)
app.use('/api/tailors', tailorsRouter)
app.use('/api/locations', locationsRouter)
app.use('/api/subscriptions', subscriptionsRouter)
app.use('/api/inquiries', inquiriesRouter)
app.use('/api/favorites', favoritesRouter)
app.use('/api/uploads', uploadsRouter)
app.use('/api/admin', adminRouter)

app.get('/health', (req, res) => res.json({ status: 'ok' }))
app.use(errorHandler)

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
  startSubscriptionCron()
}).catch(err => { console.error('MongoDB connection failed:', err.message); process.exit(1) })
