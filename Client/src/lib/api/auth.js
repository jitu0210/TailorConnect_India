import { req } from './client.js'

export const authApi = {
  register:        (body)        => req('/auth/register',        { method: 'POST', body: JSON.stringify(body) }),
  login:           (body)        => req('/auth/login',           { method: 'POST', body: JSON.stringify(body) }),
  me:              (token)       => req('/auth/me',              {},                                             token),
  updateMe:        (body, token) => req('/auth/me',              { method: 'PATCH', body: JSON.stringify(body) }, token),
  changePassword:  (body, token) => req('/auth/change-password', { method: 'POST',  body: JSON.stringify(body) }, token),
  tailorOtpSend:   (body)        => req('/auth/tailor-otp/send',   { method: 'POST', body: JSON.stringify(body) }),
  tailorOtpVerify: (body)        => req('/auth/tailor-otp/verify', { method: 'POST', body: JSON.stringify(body) }),
  forgotSend:      (body)        => req('/auth/forgot/send',        { method: 'POST', body: JSON.stringify(body) }),
  forgotReset:     (body)        => req('/auth/forgot/reset',       { method: 'POST', body: JSON.stringify(body) }),
}
