import mongoose from 'mongoose'

const subscriptionSchema = new mongoose.Schema(
  {
    tailor: { type: mongoose.Schema.Types.ObjectId, ref: 'Tailor', required: true },
    plan: { type: String, enum: ['free', 'premium'], default: 'free' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    amount: { type: Number },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['pending', 'active', 'expired', 'failed'], default: 'pending' },
    startDate: { type: Date },
    expiryDate: { type: Date },
  },
  { timestamps: true }
)

subscriptionSchema.index({ tailor: 1 })
subscriptionSchema.index({ razorpayOrderId: 1 })

export default mongoose.model('Subscription', subscriptionSchema)
