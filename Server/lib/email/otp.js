import nodemailer from 'nodemailer'

const transport = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendOtpEmail(to, otp, type = 'login') {
  const isReset = type === 'reset'
  const subject = isReset ? 'Reset your TailorConnect password' : 'Your TailorConnect login code'
  const heading = isReset ? 'Reset your password' : 'Your login code'
  const subtext = isReset
    ? 'Enter this code to set a new password for your account.'
    : 'Enter this code to access your shop dashboard.'

  const digits = String(otp).split('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=EB+Garamond:ital,wght@0,400;1,400&family=Archivo:wght@400;500;600&display=swap');
</style>
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#eceae3;-webkit-font-smoothing:antialiased;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eceae3;padding:36px 16px 48px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:500px;">

  <tr><td style="background:#111111;border-radius:3px 3px 0 0;padding:18px 28px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td>
          <span style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:600;font-size:22px;color:#ffffff;letter-spacing:0.01em;line-height:1;">TailorConnect</span>
          <span style="font-family:'Archivo','Helvetica Neue',Arial,sans-serif;font-weight:500;font-size:8.5px;color:#9a9a9a;text-transform:uppercase;letter-spacing:0.22em;display:block;margin-top:3px;">India</span>
        </td>
        <td align="right" style="vertical-align:middle;">
          <span style="font-family:'Archivo','Helvetica Neue',Arial,sans-serif;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:0.16em;color:#6e6e6e;">
            ${isReset ? 'Password reset' : 'Shop login'}
          </span>
        </td>
      </tr>
    </table>
  </td></tr>

  <tr><td style="background:#faf9f5;border-left:1px solid #dcd9d2;border-right:1px solid #dcd9d2;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="padding:36px 32px 0;">
        <h1 style="margin:0 0 10px 0;font-family:'Cormorant Garamond',Georgia,serif;font-weight:600;font-size:42px;color:#111111;line-height:1.0;letter-spacing:-0.01em;">${heading}</h1>
        <p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-style:italic;font-size:18px;color:#4a4a4a;line-height:1.55;">${subtext}</p>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="padding:24px 32px 20px;">
        <div style="border-top:1.5px dashed #111111;line-height:0;font-size:0;">&nbsp;</div>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="padding:0 32px 14px;">
        <span style="font-family:'Archivo','Helvetica Neue',Arial,sans-serif;font-size:9.5px;font-weight:600;text-transform:uppercase;letter-spacing:0.2em;color:#6e6e6e;">Your one-time code</span>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="padding:0 32px;">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            ${digits.map((d, i) => `
            <td style="padding-right:${i === 2 ? '12px' : '6px'};">
              <div style="width:48px;height:58px;background:#ffffff;border:1.5px solid #c4c4c4;border-radius:3px;text-align:center;line-height:58px;font-family:'Archivo','Helvetica Neue',Arial,sans-serif;font-size:28px;font-weight:600;color:#111111;letter-spacing:0;">
                ${d}
              </div>
            </td>`).join('')}
          </tr>
        </table>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="padding:14px 32px 32px;">
        <span style="font-family:'Archivo','Helvetica Neue',Arial,sans-serif;font-size:10px;color:#9a9a9a;letter-spacing:0.04em;">
          Expires in 10 minutes &nbsp;&middot;&nbsp; Do not share this code
        </span>
      </td></tr>
    </table>

  </td></tr>

  <tr><td style="background:#f4f2ea;border:1px solid #dcd9d2;border-top:none;border-radius:0 0 3px 3px;padding:16px 32px;">
    <p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-style:italic;font-size:15px;color:#9a9a9a;line-height:1.5;">
      If you didn't request this, you can safely ignore this email.
    </p>
  </td></tr>

  <tr><td style="padding:20px 0 0;" align="center">
    <span style="font-family:'Archivo','Helvetica Neue',Arial,sans-serif;font-size:9px;font-weight:500;text-transform:uppercase;letter-spacing:0.18em;color:#9a9a9a;">
      Bespoke, nearby.
    </span>
  </td></tr>

</table>
</td></tr>
</table>

</body>
</html>`

  const text = `${heading}\n\n${subtext}\n\nYour code: ${otp}\n\nExpires in 10 minutes. Do not share this code.\n\n— TailorConnect India`

  try {
    await transport.sendMail({
      from: process.env.EMAIL_FROM || `"TailorConnect India" <noreply@tailorconnect.in>`,
      to,
      subject,
      text,
      html,
    })
  } catch (err) {
    console.error('[email] send failed:', err.message)
    throw new Error('Could not send email. Please try again later.')
  }
}
