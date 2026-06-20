import mongoose from 'mongoose'

const locationSchema = new mongoose.Schema({
  state: { type: String, required: true, trim: true },
  district: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  lat: { type: Number },
  lng: { type: Number },
})

locationSchema.index({ state: 1, district: 1, city: 1 })

export default mongoose.model('Location', locationSchema)
