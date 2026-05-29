import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_HEADERS = ['Su','Mo','Tu','We','Th','Fr','Sa']

function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate() }
function firstWeekday(y, m) { return new Date(y, m, 1).getDay() }
function sameDay(a, b) { return a && b && a.toDateString() === b.toDateString() }

export function formatDateRange(start, end) {
  if (!start && !end) return null
  const fmt = d => d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })
  if (!end) return fmt(start)
  return `${fmt(start)} – ${fmt(end)}`
}

export default function DateRangePicker({ start, end, onChange, onClose }) {
  const today = new Date()
  const [year, setYear]   = useState(start?.getFullYear() ?? today.getFullYear())
  const [month, setMonth] = useState(start?.getMonth() ?? today.getMonth())
  const [picking, setPicking] = useState(!start ? 'start' : !end ? 'end' : 'start')
  const [draft, setDraft]     = useState({ start: start ?? null, end: end ?? null })
  const [hovered, setHovered] = useState(null)

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const clickDay = (day) => {
    const date = new Date(year, month, day)
    if (picking === 'start') {
      setDraft({ start: date, end: null })
      setPicking('end')
    } else {
      if (date < draft.start) {
        setDraft({ start: date, end: draft.start })
      } else {
        setDraft(d => ({ ...d, end: date }))
      }
      setPicking('done')
    }
  }

  const inRange = (day) => {
    const date = new Date(year, month, day)
    const rangeEnd = picking === 'end' && hovered ? hovered : draft.end
    if (!draft.start || !rangeEnd) return false
    const [lo, hi] = draft.start <= rangeEnd ? [draft.start, rangeEnd] : [rangeEnd, draft.start]
    return date > lo && date < hi
  }

  const isStart = (day) => sameDay(new Date(year, month, day), draft.start)
  const isEnd   = (day) => {
    const rangeEnd = picking === 'end' && hovered ? hovered : draft.end
    return sameDay(new Date(year, month, day), rangeEnd)
  }

  const apply = () => {
    if (draft.start && draft.end) {
      onChange(draft.start, draft.end)
      onClose()
    }
  }

  const fmt = d => d ? d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-72">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <span className="text-sm font-semibold text-gray-800">{MONTHS[month]} {year}</span>
        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map(d => (
          <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {[...Array(firstWeekday(year, month))].map((_, i) => <div key={`pad-${i}`} />)}
        {[...Array(daysInMonth(year, month))].map((_, i) => {
          const day   = i + 1
          const start = isStart(day)
          const end_  = isEnd(day)
          const range = inRange(day)
          return (
            <button
              key={day}
              onClick={() => clickDay(day)}
              onMouseEnter={() => picking === 'end' && setHovered(new Date(year, month, day))}
              onMouseLeave={() => picking === 'end' && setHovered(null)}
              className={[
                'h-8 w-full flex items-center justify-center text-xs transition-colors',
                start || end_ ? 'bg-primary text-white font-bold rounded-full' : '',
                range        ? 'bg-red-50 text-primary rounded-none' : '',
                !start && !end_ && !range ? 'hover:bg-gray-100 text-gray-700 rounded-full' : '',
              ].join(' ')}
            >
              {day}
            </button>
          )
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs mb-3 px-1">
          <div>
            <div className="text-gray-400 mb-0.5">Start</div>
            <div className={`font-semibold ${draft.start ? 'text-gray-800' : 'text-gray-300'}`}>{fmt(draft.start)}</div>
          </div>
          <span className="text-gray-300 text-base">→</span>
          <div className="text-right">
            <div className="text-gray-400 mb-0.5">End</div>
            <div className={`font-semibold ${draft.end ? 'text-gray-800' : 'text-gray-300'}`}>{fmt(draft.end)}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 btn-outline text-xs py-1.5">Cancel</button>
          <button
            onClick={apply}
            disabled={!draft.start || !draft.end}
            className="flex-1 btn-primary text-xs py-1.5 disabled:opacity-40"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
