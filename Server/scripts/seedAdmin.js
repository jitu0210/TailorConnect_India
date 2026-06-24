import 'dotenv/config'
import mongoose from 'mongoose'
import User from '../models/User.js'

async function seed() {
  const username = process.env.ADMIN_USERNAME
  const password = process.env.ADMIN_PASSWORD
  if (!username || !password) {
    console.error('ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGODB_URI)

  const existing = await User.findOne({ email: username })
  if (existing) {
    console.log('Admin already exists — skipping.')
    await mongoose.disconnect()
    return
  }

  await User.create({
    fullName: 'TailorConnect Admin',
    email: username,
    password,
    role: 'admin',
    mobile: '0000000000',
    isActive: true,
  })

  console.log(`Admin seeded: username=${username}`)
  await mongoose.disconnect()
}

seed().catch(err => { console.error(err); process.exit(1) })
