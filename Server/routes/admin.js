import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'
import {
  getAnalytics, getRecent,
  getUsers, toggleUserActive, deleteUser,
  getTailors, setTailorStatus, toggleVerify, toggleTopRated, deleteTailor,
  getReviews, deleteReview,
  getSubscriptions, getTimeseries,
} from '../controllers/admin.controller.js'

const router = Router()
router.use(protect, requireRole('admin'))

router.get( '/analytics',              getAnalytics)
router.get( '/recent',                 getRecent)

router.get( '/users',                  getUsers)
router.patch('/users/:id/toggle-active', toggleUserActive)
router.delete('/users/:id',            deleteUser)

router.get( '/tailors',                getTailors)
router.patch('/tailors/:id/status',    setTailorStatus)
router.patch('/tailors/:id/verify',    toggleVerify)
router.patch('/tailors/:id/top-rated', toggleTopRated)
router.delete('/tailors/:id',          deleteTailor)

router.get(   '/reviews',              getReviews)
router.delete('/reviews/:id',          deleteReview)

router.get('/subscriptions',           getSubscriptions)
router.get('/timeseries',              getTimeseries)

export default router
