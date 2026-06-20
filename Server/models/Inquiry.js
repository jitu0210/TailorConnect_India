import mongoose from 'mongoose'

const inquirySchema = new mongoose.Schema(
  {
    tailor: { type: mongoose.Schema.Types.ObjectId, ref: 'Tailor', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true },
    customerMobile: { type: String, trim: true },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
)

inquirySchema.index({ tailor: 1, createdAt: -1 })
inquirySchema.index({ customer: 1, createdAt: -1 })

export default mongoose.model('Inquiry', inquirySchema)
