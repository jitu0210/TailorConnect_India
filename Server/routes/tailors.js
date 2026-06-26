import { Router } from 'express'
import { protect, optionalAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'
import { attachTailor } from '../middleware/tailor.js'
import {
  searchTailors, getFeatured, getTopRated, getPopularCities,
  getMyProfile, getMyReviews, getCustomerReviews,
  getTailorById, createProfile, updateProfile,
  getReviews, postReview, replyToReview,
} from '../controllers/tailors.controller.js'

const router = Router()

// Public: browse
router.get('/',                    searchTailors)
router.get('/featured',            getFeatured)
router.get('/top-rated',           getTopRated)
router.get('/popular-cities',      getPopularCities)

// Tailor dashboard (must be before /:id)
router.get('/me/profile',          protect, requireRole('tailor'), attachTailor, getMyProfile)
router.get('/me/reviews',          protect, requireRole('tailor'), attachTailor, getMyReviews)
router.get('/customer/my-reviews', protect, requireRole('customer'), getCustomerReviews)

// Public: single tailor
router.get('/:id',                 optionalAuth, getTailorById)

// Tailor registration & profile
router.post('/',                   protect, requireRole('tailor'), createProfile)
router.patch('/me',                protect, requireRole('tailor'), updateProfile)

// Reviews
router.get( '/:id/reviews',        getReviews)
router.post('/:id/reviews',        protect, postReview)
router.post('/reviews/:reviewId/reply', protect, requireRole('tailor'), attachTailor, replyToReview)

export default router
