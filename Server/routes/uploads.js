import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'
import { attachTailor } from '../middleware/tailor.js'
import { uploadProfileImage, uploadTailorProfile, uploadGallery, uploadReviewPhotos } from '../middleware/upload.js'
import {
  uploadProfile, uploadTailorProfile as handleTailorProfile,
  uploadGallery as handleGallery, deleteGallery,
  uploadReviewPhotos as handleReviewPhotos,
} from '../controllers/uploads.controller.js'

const router = Router()

router.post('/profile',
  protect,
  uploadProfileImage.single('image'),
  uploadProfile
)

router.post('/tailor-profile',
  protect, requireRole('tailor'),
  uploadTailorProfile.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]),
  attachTailor,
  handleTailorProfile
)

router.post('/gallery',
  protect, requireRole('tailor'),
  uploadGallery.single('image'),
  attachTailor,
  handleGallery
)

router.delete('/gallery/:itemId',
  protect, requireRole('tailor'),
  attachTailor,
  deleteGallery
)

router.post('/review-photos',
  protect,
  uploadReviewPhotos.array('photos', 3),
  handleReviewPhotos
)

export default router
