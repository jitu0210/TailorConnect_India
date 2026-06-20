import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const makeStorage = (folder, allowedFormats = ['jpg', 'jpeg', 'png', 'webp']) =>
  new CloudinaryStorage({ cloudinary, params: { folder, allowed_formats: allowedFormats } })

export const uploadProfileImage = multer({
  storage: makeStorage('tailorconnect/users'),
  limits: { fileSize: 5 * 1024 * 1024 },
})

export const uploadTailorProfile = multer({
  storage: makeStorage('tailorconnect/tailors/profile'),
  limits: { fileSize: 5 * 1024 * 1024 },
})

export const uploadGallery = multer({
  storage: makeStorage('tailorconnect/tailors/gallery'),
  limits: { fileSize: 8 * 1024 * 1024 },
})

export const uploadReviewPhotos = multer({
  storage: makeStorage('tailorconnect/reviews'),
  limits: { fileSize: 5 * 1024 * 1024 },
})

export { cloudinary }
