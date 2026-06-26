import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export async function sendTrialExpiryReminder(tailor, ownerEmail, ownerName, daysLeft) {
  const trialEnd = formatDate(tailor.freeTrialEnds)
  const dashboardUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/tailor`

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf9f5;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf9f5;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #dcd9d2;border-radius:3px;overflow:hidden">

        <tr><td style="background:#111111;padding:32px 40px">
          <p style="margin:0;font-family:Georgia,serif;font-size:22px;font-weight:600;color:#ffffff;letter-spacing:-0.02em">
            TailorConnect <span style="font-size:11px;font-weight:400;letter-spacing:0.1em;color:#6e6e6e;text-transform:uppercase">India</span>
          </p>
        </td></tr>

        <tr><td style="padding:40px">
          <p style="margin:0 0 6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#9a9a9a">
            Your free trial is ending soon
          </p>
          <h1 style="margin:0 0 24px;font-family:Georgia,serif;font-size:32px;font-weight:600;color:#111111;line-height:1.1">
            ${daysLeft} day${daysLeft === 1 ? '' : 's'} left on your free storefront.
          </h1>
          <p style="margin:0 0 20px;font-size:16px;color:#4a4a4a;line-height:1.6">
            Hi ${ownerName}, your 6-month early bird trial for <strong>${tailor.shopName}</strong> on TailorConnect India ends on <strong>${trialEnd}</strong>.
          </p>
          <p style="margin:0 0 32px;font-size:16px;color:#4a4a4a;line-height:1.6">
            After that date, your shop will be paused and won't appear in search results until you subscribe. Choose a plan to keep your storefront live:
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px">
            <tr>
              <td width="33%" style="padding:0 6px 0 0;vertical-align:top">
                <div style="border:1px solid #dcd9d2;border-radius:3px;padding:20px 16px;text-align:center">
                  <p style="margin:0 0 4px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#9a9a9a">Monthly</p>
                  <p style="margin:0 0 12px;font-family:Georgia,serif;font-size:28px;font-weight:600;color:#111111">$5</p>
                  <p style="margin:0;font-size:12px;color:#6e6e6e">per month</p>
                </div>
              </td>
              <td width="33%" style="padding:0 3px;vertical-align:top">
                <div style="border:2px solid #111111;border-radius:3px;padding:20px 16px;text-align:center">
                  <p style="margin:0 0 4px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#9a9a9a">6 Months</p>
                  <p style="margin:0 0 12px;font-family:Georgia,serif;font-size:28px;font-weight:600;color:#111111">$20</p>
                  <p style="margin:0;font-size:12px;color:#6e6e6e">save 33%</p>
                </div>
              </td>
              <td width="33%" style="padding:0 0 0 6px;vertical-align:top">
                <div style="border:1px solid #dcd9d2;border-radius:3px;padding:20px 16px;text-align:center">
                  <p style="margin:0 0 4px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#9a9a9a">Annual</p>
                  <p style="margin:0 0 12px;font-family:Georgia,serif;font-size:28px;font-weight:600;color:#111111">$35</p>
                  <p style="margin:0;font-size:12px;color:#6e6e6e">save 42%</p>
                </div>
              </td>
            </tr>
          </table>

          <a href="${dashboardUrl}" style="display:block;background:#111111;color:#ffffff;text-align:center;text-decoration:none;padding:16px 24px;border-radius:3px;font-size:13px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase">
            Choose a plan &amp; keep your shop live →
          </a>

          <p style="margin:32px 0 0;font-size:14px;color:#9a9a9a;font-style:italic;line-height:1.5">
            If you have questions, reply to this email and we'll help you out.
          </p>
        </td></tr>

        <tr><td style="border-top:1px solid #eceae3;padding:24px 40px">
          <p style="margin:0;font-size:11px;color:#9a9a9a">
            TailorConnect India · Bespoke, nearby. · You're receiving this because you registered a tailor shop on our platform.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'TailorConnect India <noreply@tailorconnect.in>',
    to: ownerEmail,
    subject: `Your free storefront ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'} — keep ${tailor.shopName} live`,
    html,
  })
}

export async function sendSubscriptionConfirmation(tailor, ownerEmail, ownerName, plan, expiryDate) {
  const planLabels = { monthly: 'Monthly ($5)', semiannual: '6-Month ($20)', annual: 'Annual ($35)' }
  const dashboardUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/tailor`

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'TailorConnect India <noreply@tailorconnect.in>',
    to: ownerEmail,
    subject: `Subscription confirmed — ${tailor.shopName} is live on TailorConnect`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:40px 20px;background:#faf9f5;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #dcd9d2;border-radius:3px;overflow:hidden">
    <div style="background:#111;padding:32px 40px">
      <p style="margin:0;font-family:Georgia,serif;font-size:22px;font-weight:600;color:#fff">TailorConnect <span style="font-size:11px;font-weight:400;color:#6e6e6e;text-transform:uppercase;letter-spacing:.1em">India</span></p>
    </div>
    <div style="padding:40px">
      <p style="margin:0 0 6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:#9a9a9a">Payment confirmed</p>
      <h1 style="margin:0 0 24px;font-family:Georgia,serif;font-size:32px;color:#111;line-height:1.1">Your shop is live. ✓</h1>
      <p style="margin:0 0 16px;font-size:16px;color:#4a4a4a;line-height:1.6">
        Hi ${ownerName}, your <strong>${planLabels[plan]}</strong> subscription for <strong>${tailor.shopName}</strong> is now active.
      </p>
      <p style="margin:0 0 32px;font-size:16px;color:#4a4a4a;line-height:1.6">
        Your storefront will remain live until <strong>${formatDate(expiryDate)}</strong>.
      </p>
      <a href="${dashboardUrl}" style="display:block;background:#111;color:#fff;text-align:center;text-decoration:none;padding:16px 24px;border-radius:3px;font-size:13px;font-weight:600;letter-spacing:.04em;text-transform:uppercase">
        Go to dashboard →
      </a>
    </div>
  </div>
</body>
</html>`,
  })
}
