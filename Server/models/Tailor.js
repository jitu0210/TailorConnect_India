import mongoose from 'mongoose'

const locationSchema = new mongoose.Schema(
  { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: [Number] },
  { _id: false }
)

const openingHoursSchema = new mongoose.Schema(
  { open: String, close: String, closed: { type: Boolean, default: false } },
  { _id: false }
)

const tailorSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shopName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    whatsapp: { type: String, required: true, trim: true },
    mobile: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },

    address: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    district: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    location: locationSchema,
    serviceRadius: { type: Number, default: 10 }, // km

    specialties: [{ type: String, trim: true }],
    bio: { type: String, trim: true, maxlength: 500 },
    experience: { type: Number, default: 0 }, // years

    openingHours: {
      monday: openingHoursSchema, tuesday: openingHoursSchema, wednesday: openingHoursSchema,
      thursday: openingHoursSchema, friday: openingHoursSchema, saturday: openingHoursSchema,
      sunday: openingHoursSchema,
    },

    isVerified: { type: Boolean, default: false },
    isTopRated: { type: Boolean, default: false },
    isOpenNow: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },

    subscriptionType: { type: String, enum: ['free', 'premium'], default: 'free' },
    subscriptionExpiry: { type: Date },

    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },

    profileImage: { type: String },
    coverImage: { type: String },
    gallery: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
        category: {
          type: String,
          enum: ["Men's Wear", "Women's Wear", 'Bridal Wear', 'Alterations', 'Uniforms', 'Designer'],
          default: "Men's Wear",
        },
        caption: { type: String, trim: true },
      },
    ],
  },
  { timestamps: true }
)

tailorSchema.index({ location: '2dsphere' })
tailorSchema.index({ city: 1, district: 1, state: 1, isActive: 1, status: 1 })
tailorSchema.index({ specialties: 1 })
tailorSchema.index({ subscriptionType: 1, rating: -1 })
tailorSchema.index({ shopName: 'text', bio: 'text', specialties: 'text' })

export default mongoose.model('Tailor', tailorSchema)
