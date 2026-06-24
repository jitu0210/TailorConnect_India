import { Select } from './Input'
import { getStates, getDistricts, getCities } from '../../data/indiaLocations'

// Uses bundled static data — works instantly, no network dependency.
export default function LocationSelector({ value = {}, onChange, required = false }) {
  const { state = '', district = '', city = '' } = value

  const states    = getStates()
  const districts = state    ? getDistricts(state)             : []
  const cities    = district ? getCities(state, district)      : []

  const onState    = e => onChange({ state: e.target.value, district: '', city: '' })
  const onDistrict = e => onChange({ state, district: e.target.value, city: '' })
  const onCity     = e => onChange({ state, district, city: e.target.value })

  return (
    <div className="space-y-3">
      <Select
        label="State"
        value={state}
        onChange={onState}
        required={required}
      >
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
    </div>
  )
}
