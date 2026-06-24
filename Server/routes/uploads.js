import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'
import { uploadProfileImage, uploadTailorProfile, uploadGallery, uploadReviewPhotos, cloudinary } from '../middleware/upload.js'
import Tailor from '../models/Tailor.js'

const router = Router()

// POST /api/uploads/profile  (any authenticated user)
router.post('/profile', protect, uploadProfileImage.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
    res.json({ url: req.file.path, publicId: req.file.filename })
  } catch (err) { next(err) }
})

// POST /api/uploads/tailor-profile  (tailor: profile/cover image)
router.post('/tailor-profile', protect, requireRole('tailor'), uploadTailorProfile.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
]), async (req, res, next) => {
  try {
    const tailor = await Tailor.findOne({ owner: req.user._id })
    if (!tailor) return res.status(404).json({ message: 'Tailor profile not found' })

    const updates = {}
    if (req.files?.profileImage?.[0]) {
      if (tailor.profileImage) {
        const pid = tailor.profileImage.split('/').pop().split('.')[0]
        await cloudinary.uploader.destroy(`tailorconnect/tailors/profile/${pid}`).catch(() => {})
      }
      updates.profileImage = req.files.profileImage[0].path
    }
    if (req.files?.coverImage?.[0]) {
      if (tailor.coverImage) {
        const pid = tailor.coverImage.split('/').pop().split('.')[0]
        await cloudinary.uploader.destroy(`tailorconnect/tailors/profile/${pid}`).catch(() => {})
      }
      updates.coverImage = req.files.coverImage[0].path
    }

    const updated = await Tailor.findByIdAndUpdate(tailor._id, updates, { new: true })
    res.json({ profileImage: updated.profileImage, coverImage: updated.coverImage })
  } catch (err) { next(err) }
})

// POST /api/uploads/gallery  (tailor: add gallery image)
router.post('/gallery', protect, requireRole('tailor'), uploadGallery.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
    const tailor = await Tailor.findOne({ owner: req.user._id })
    if (!tailor) return res.status(404).json({ message: 'Tailor profile not found' })

    const { category = "Men's Wear", caption = '' } = req.body
    const galleryItem = { url: req.file.path, publicId: req.file.filename, category, caption }
    const updated = await Tailor.findByIdAndUpdate(
      tailor._id,
      { $push: { gallery: galleryItem } },
      { new: true }
    )
    res.status(201).json(updated.gallery[updated.gallery.length - 1])
  } catch (err) { next(err) }
})

// DELETE /api/uploads/gallery/:itemId  (tailor: remove gallery image)
router.delete('/gallery/:itemId', protect, requireRole('tailor'), async (req, res, next) => {
  try {
    const tailor = await Tailor.findOne({ owner: req.user._id })
    if (!tailor) return res.status(404).json({ message: 'Tailor profile not found' })

    const item = tailor.gallery.id(req.params.itemId)
    if (!item) return res.status(404).json({ message: 'Gallery item not found' })

    if (item.publicId) {
      await cloudinary.uploader.destroy(item.publicId).catch(() => {})
    }
    await Tailor.findByIdAndUpdate(tailor._id, { $pull: { gallery: { _id: req.params.itemId } } })
    res.json({ message: 'Gallery item removed' })
  } catch (err) { next(err) }
})

// POST /api/uploads/review-photos  (any authenticated user, for reviews)
router.post('/review-photos', protect, uploadReviewPhotos.array('photos', 3), async (req, res, next) => {
  try {
    if (!req.files?.length) return res.status(400).json({ message: 'No files uploaded' })
    res.json(req.files.map(f => ({ url: f.path, publicId: f.filename })))
  } catch (err) { next(err) }
})

export default router
