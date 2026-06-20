import 'dotenv/config'
import mongoose from 'mongoose'
import Location from '../models/Location.js'
import { getFlatLocations } from './indiaLocations.js'

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  await Location.deleteMany({})
  const docs = getFlatLocations()
  await Location.insertMany(docs)
  console.log(`Seeded ${docs.length} locations.`)
  await mongoose.disconnect()
}

seed().catch(e => { console.error(e); process.exit(1) })
