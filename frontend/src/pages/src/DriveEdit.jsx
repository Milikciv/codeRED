import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import PageLayout from '../../components/layout/PageLayout'
import {
  CalendarDays, Clock, Droplets, MapPin, ExternalLink,
  Save, Trash2, ChevronLeft, Users
} from 'lucide-react'

const BLOOD_TYPES = ['O-', 'O+', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
const STATUSES    = ['Planned', 'Confirmed']

const BLOOD_COLOR = {
  'O-':  '#EF4444', 'O+':  '#F97316', 'A+':  '#3B82F6', 'A-':  '#8B5CF6',
  'B+':  '#22C55E', 'B-':  '#EC4899', 'AB+': '#14B8A6', 'AB-': '#6366F1',
}

const STATUS_BADGE = {
  Planned:   'bg-blue-50 text-blue-700 border border-blue-200',
  Confirmed: 'bg-green-50 text-green-700 border border-green-200',
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors'

export default function DriveEdit() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const drive     = location.state?.drive

  const [form, setForm] = useState({
    location:        drive?.location        ?? '',
    address:         drive?.address         ?? '',
    bloodType:       drive?.bloodType       ?? 'O+',
    date:            drive?.date            ?? '',
    time:            drive?.time            ?? '',
    expectedMin:     drive?.expectedDonorsMin ?? 60,
    expectedMax:     drive?.expectedDonorsMax ?? 80,
    status:          drive?.status          ?? 'Planned',
    staffAssigned:   drive?.staffAssigned   ?? 0,
    notes:           drive?.notes           ?? '',
  })

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function handleSave(e) {
    e.preventDefault()
    // In production this would call the API; for now just navigate back
    navigate('/src/donation-drives')
  }

  return (
    <PageLayout
      title="Edit Drive"
      subtitle={drive ? `Editing: ${drive.location}` : 'Edit donation drive details'}
      actions={
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      }
    >
      <form onSubmit={handleSave} className="max-w-2xl space-y-6">

        {/* Linked alert — read-only */}
        {drive?.linkedAlert && (
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-4 py-3">
            <Droplets className="w-4 h-4 text-primary flex-shrink-0" />
            <span>Linked to alert</span>
            <button
              type="button"
              onClick={() => navigate(`/src/drive-planning?alertId=${drive.linkedAlert}`)}
              className="font-semibold text-primary hover:underline flex items-center gap-1"
            >
              {drive.linkedAlert} <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Location */}
        <div className="card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> Location
          </h3>
          <Field label="Venue Name" required>
            <input
              className={inputCls}
              value={form.location}
              onChange={e => set('location', e.target.value)}
              placeholder="e.g. Tampines Community Plaza"
              required
            />
          </Field>
          <Field label="Full Address" required>
            <input
              className={inputCls}
              value={form.address}
              onChange={e => set('address', e.target.value)}
              placeholder="e.g. Tampines Street 11, Singapore 529455"
              required
            />
          </Field>
        </div>

        {/* Schedule */}
        <div className="card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" /> Schedule
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date" required>
              <input
                className={inputCls}
                value={form.date}
                onChange={e => set('date', e.target.value)}
                placeholder="e.g. 31 May 2026"
                required
              />
            </Field>
            <Field label="Time">
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input
                  className={`${inputCls} pl-8`}
                  value={form.time}
                  onChange={e => set('time', e.target.value)}
                  placeholder="e.g. 10:00 AM – 4:00 PM"
                />
              </div>
            </Field>
          </div>
        </div>

        {/* Drive details */}
        <div className="card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-primary" /> Drive Details
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Target Blood Type" required>
              <select
                className={inputCls}
                value={form.bloodType}
                onChange={e => set('bloodType', e.target.value)}
              >
                {BLOOD_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {form.bloodType && (
                <div
                  className="mt-1.5 text-xs font-semibold flex items-center gap-1"
                  style={{ color: BLOOD_COLOR[form.bloodType] }}
                >
                  <Droplets className="w-3 h-3" /> {form.bloodType} selected
                </div>
              )}
            </Field>

            <Field label="Status" required>
              <select
                className={inputCls}
                value={form.status}
                onChange={e => set('status', e.target.value)}
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {form.status && (
                <span className={`mt-1.5 inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[form.status]}`}>
                  {form.status}
                </span>
              )}
            </Field>
          </div>

          <Field label="Expected Donors">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                className={inputCls}
                value={form.expectedMin}
                onChange={e => set('expectedMin', Number(e.target.value))}
                placeholder="Min"
              />
              <span className="text-gray-400 text-sm flex-shrink-0">–</span>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={form.expectedMax}
                onChange={e => set('expectedMax', Number(e.target.value))}
                placeholder="Max"
              />
            </div>
          </Field>

          <Field label="Staff Assigned">
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                type="number"
                min={0}
                className={`${inputCls} pl-8`}
                value={form.staffAssigned}
                onChange={e => set('staffAssigned', Number(e.target.value))}
              />
            </div>
          </Field>
        </div>

        {/* Notes */}
        <div className="card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Notes</h3>
          <Field label="Internal notes (optional)">
            <textarea
              rows={3}
              className={`${inputCls} resize-none`}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Add any relevant notes about this drive…"
            />
          </Field>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 text-sm text-red-500 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Delete Drive
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 btn-primary px-5 py-2 text-sm shadow"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>
      </form>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <h3 className="font-semibold text-gray-900 text-base mb-1">Delete this drive?</h3>
              <p className="text-sm text-gray-500 mb-5">
                This will permanently remove <span className="font-medium text-gray-700">{form.location}</span> from upcoming drives. This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => navigate('/src/donation-drives')}
                  className="flex-1 bg-red-500 text-white rounded-xl py-2 text-sm font-medium hover:bg-red-600"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </PageLayout>
  )
}
