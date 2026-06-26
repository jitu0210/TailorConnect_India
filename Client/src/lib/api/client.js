const BASE = import.meta.env.VITE_API_URL || '/api'

export async function req(path, opts = {}, token = null) {
  const headers = { 'Content-Type': 'application/json', ...opts.headers }
  if (token) headers.Authorization = `Bearer ${token}`
  const r = await fetch(`${BASE}${path}`, { ...opts, headers })
  const text = await r.text()
  let data = {}
  try { data = text ? JSON.parse(text) : {} } catch { /* non-JSON (e.g. 502 HTML) */ }
  if (!r.ok) throw new Error(data.message || `Request failed (${r.status})`)
  return data
}

// For multipart/form-data — do NOT set Content-Type (browser sets boundary)
export async function upload(path, formData, token) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  const r = await fetch(`${BASE}${path}`, { method: 'POST', body: formData, headers })
  const data = await r.json()
  if (!r.ok) throw new Error(data.message || 'Upload failed')
  return data
}
