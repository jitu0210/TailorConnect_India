import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['customer', 'tailor', 'admin'], required: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    mobile: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },

    // Location
    state: { type: String, trim: true },
    district: { type: String, trim: true },
    city: { type: String, trim: true },

    profileImage: { type: String },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tailor' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

userSchema.index({ email: 1 })

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password)
}

export default mongoose.model('User', userSchema)
