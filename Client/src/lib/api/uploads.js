import { req, upload } from './client.js'

export const uploadsApi = {
  tailorProfile: (formData, token) => upload('/uploads/tailor-profile', formData, token),
  galleryAdd:    (formData, token) => upload('/uploads/gallery',         formData, token),
  galleryDelete: (itemId, token)   => req(`/uploads/gallery/${itemId}`, { method: 'DELETE' }, token),
}
