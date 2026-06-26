import { cloudinary } from '../middleware/upload.js'
import Tailor from '../models/Tailor.js'

export async function uploadProfile(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
    res.json({ url: req.file.path, publicId: req.file.filename })
  } catch (err) { next(err) }
}

export async function uploadTailorProfile(req, res, next) {
  try {
    const tailor = req.tailor
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
}

export async function uploadGallery(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
    const { category = "Men's Wear", caption = '' } = req.body
    const galleryItem = { url: req.file.path, publicId: req.file.filename, category, caption }
    const updated = await Tailor.findByIdAndUpdate(
      req.tailor._id,
      { $push: { gallery: galleryItem } },
      { new: true }
    )
    res.status(201).json(updated.gallery[updated.gallery.length - 1])
  } catch (err) { next(err) }
}

export async function deleteGallery(req, res, next) {
  try {
    const item = req.tailor.gallery.find(g => g._id.toString() === req.params.itemId)
    if (!item) return res.status(404).json({ message: 'Gallery item not found' })

    if (item.publicId) {
      await cloudinary.uploader.destroy(item.publicId).catch(() => {})
    }
    await Tailor.findByIdAndUpdate(req.tailor._id, { $pull: { gallery: { _id: req.params.itemId } } })
    res.json({ message: 'Gallery item removed' })
  } catch (err) { next(err) }
}

export async function uploadReviewPhotos(req, res, next) {
  try {
    if (!req.files?.length) return res.status(400).json({ message: 'No files uploaded' })
    res.json(req.files.map(f => ({ url: f.path, publicId: f.filename })))
  } catch (err) { next(err) }
}
