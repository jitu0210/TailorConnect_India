import mongoose from 'mongoose'

const FEEDBACK_TAGS = [
  // English
  'Great quality', 'On time delivery', 'Good fitting', 'Reasonable price',
  'Professional', 'Friendly behavior', 'Clean stitching', 'Good fabric advice',
  // Hindi (transliterated)
  'Bahut achha kaam', 'Samay par delivery', 'Sahi fitting', 'Sasta aur achha',
  'Professional behaviour', 'Bahut helpful', 'Saaf silai', 'Kapde ki sahi salah',
]

export { FEEDBACK_TAGS }

const reviewSchema = new mongoose.Schema(
  {
    tailor: { type: mongoose.Schema.Types.ObjectId, ref: 'Tailor', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 },
    feedbackTags: [{ type: String, enum: FEEDBACK_TAGS }],
    serviceType: { type: String, trim: true },
    photos: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
      },
    ],
    tailorReply: {
      text: { type: String, trim: true, maxlength: 500 },
      repliedAt: { type: Date },
    },
    isVerifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true }
)

reviewSchema.index({ tailor: 1, createdAt: -1 })
reviewSchema.index({ customer: 1 })

async function updateTailorRating(tailorId) {
  const result = await mongoose.model('Review').aggregate([
    { $match: { tailor: tailorId } },
    { $group: { _id: '$tailor', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])
  const { avg = 0, count = 0 } = result[0] || {}
  await mongoose.model('Tailor').findByIdAndUpdate(tailorId, {
    rating: Math.round(avg * 10) / 10,
    reviewCount: count,
  })
}

reviewSchema.post('save', function () { updateTailorRating(this.tailor) })
reviewSchema.post('findOneAndDelete', function (doc) { if (doc) updateTailorRating(doc.tailor) })

export default mongoose.model('Review', reviewSchema)
