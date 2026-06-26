import cron from 'node-cron'
import Tailor from '../models/Tailor.js'
import User from '../models/User.js'
import { sendTrialExpiryReminder } from '../lib/email/subscription.js'

// Runs every day at 09:00 AM IST (03:30 UTC)
export function startSubscriptionCron() {
  cron.schedule('30 3 * * *', runDailyCheck, { timezone: 'UTC' })
  console.log('Subscription cron scheduled (daily 09:00 IST)')
}

export async function runDailyCheck() {
  const now = new Date()
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  try {
    // ── 1. Send 7-day trial expiry reminders ────────────────────────────────
    const expiring = await Tailor.find({
      isEarlyBird: true,
      trialReminderSent: false,
      freeTrialEnds: { $gt: now, $lte: in7Days },
      // Only if they don't already have an active paid subscription
      $or: [
        { subscriptionType: { $ne: 'premium' } },
        { subscriptionExpiry: { $lte: now } },
      ],
    })

    if (expiring.length > 0) {
      const ownerIds = expiring.map(t => t.owner)
      const owners = await User.find({ _id: { $in: ownerIds } }).select('email fullName').lean()
      const ownerMap = Object.fromEntries(owners.map(o => [o._id.toString(), o]))

      for (const tailor of expiring) {
        try {
          const owner = ownerMap[tailor.owner.toString()]
          if (owner?.email) {
            const daysLeft = Math.max(1, Math.ceil((tailor.freeTrialEnds - now) / (1000 * 60 * 60 * 24)))
            await sendTrialExpiryReminder(tailor, owner.email, owner.fullName, daysLeft)
            await Tailor.findByIdAndUpdate(tailor._id, { trialReminderSent: true })
            console.log(`Trial reminder sent to ${owner.email} for shop: ${tailor.shopName}`)
          }
        } catch (err) {
          console.error(`Failed to send reminder for tailor ${tailor._id}:`, err.message)
        }
      }
    }

    // ── 2. Deactivate shops with no valid access ─────────────────────────────
    // A shop stays active if it has either:
    //   (a) an active early-bird trial, OR
    //   (b) an active paid subscription
    // Two $or conditions must be wrapped in $and (JS objects can't have duplicate keys)
    const deactivateResult = await Tailor.updateMany(
      {
        status: 'approved',
        isActive: true,
        $and: [
          // No active paid subscription
          { $or: [{ subscriptionType: { $ne: 'premium' } }, { subscriptionExpiry: { $lte: now } }] },
          // AND no active free trial
          { $or: [{ isEarlyBird: { $ne: true } }, { freeTrialEnds: { $lte: now } }] },
        ],
      },
      { isActive: false }
    )

    // ── 3. Reactivate shops whose subscription was renewed ───────────────────
    const reactivateResult = await Tailor.updateMany(
      {
        status: 'approved',
        isActive: false,
        subscriptionType: 'premium',
        subscriptionExpiry: { $gt: now },
      },
      { isActive: true }
    )

    console.log(
      `Cron done — deactivated: ${deactivateResult.modifiedCount}, reactivated: ${reactivateResult.modifiedCount}`
    )
  } catch (err) {
    console.error('Subscription cron error:', err.message)
  }
}
