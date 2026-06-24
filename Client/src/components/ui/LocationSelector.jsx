import { useEffect } from 'react'
import { Input, Select } from './Input'
import { getStates, getDistricts, getCities, getCityPincode } from '../../data/indiaLocations'

// Uses bundled static data — works instantly, no network dependency.
export default function LocationSelector({ value = {}, onChange, required = false, showPincode = true }) {
  const { state = '', district = '', city = '', pincode = '' } = value

  const states    = getStates()
  const districts = state    ? getDistricts(state)        : []
  const cities    = district ? getCities(state, district) : []

  // Auto-fill pincode when city is selected and pincode is not yet set
  useEffect(() => {
    if (city && !pincode) {
      const auto = getCityPincode(state, district, city)
      if (auto) onChange({ state, district, city, pincode: auto })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city])

  const onState    = e => onChange({ state: e.target.value, district: '', city: '', pincode: '' })
  const onDistrict = e => onChange({ state, district: e.target.value, city: '', pincode: '' })
  const onCity     = e => {
    const newCity = e.target.value
    const auto = newCity ? getCityPincode(state, district, newCity) : ''
    onChange({ state, district, city: newCity, pincode: auto })
  }
  const onPincode  = e => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
    onChange({ state, district, city, pincode: val })
  }

  return (
    <div className="space-y-3">
      <Select label="State" value={state} onChange={onState} required={required}>
        <option value="">Select state…</option>
        {states.map(s => <option key={s} value={s}>{s}</option>)}
      </Select>

      <Select
        label="District"
        value={district}
        onChange={onDistrict}
        required={required && !!state}
        disabled={!state}
      >
        <option value="">{!state ? 'Select state first' : 'Select district…'}</option>
        {districts.map(d => <option key={d} value={d}>{d}</option>)}
      </Select>

      <Select
        label="City / Town"
        value={city}
        onChange={onCity}
        required={required && !!district}
        disabled={!district}
      >
        <option value="">{!district ? 'Select district first' : 'Select city / town…'}</option>
        {cities.map(c => <option key={c} value={c}>{c}</option>)}
      </Select>

      {showPincode && (
        <Input
          label="Pincode"
          type="text"
          inputMode="numeric"
          value={pincode}
          onChange={onPincode}
          placeholder="6-digit pincode"
          hint={pincode && pincode.length < 6 ? 'Must be 6 digits' : undefined}
          required={required && !!city}
          maxLength={6}
        />
      )}
    </div>
  )
}
