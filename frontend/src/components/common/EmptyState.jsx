import { motion } from 'framer-motion'

const floatStyle = (delay = 0) => ({
  animation: `cr-float 2.4s ease-in-out ${delay}s infinite`,
  transformBox: 'fill-box',
  transformOrigin: 'center',
})

function EmptyMascot({ scale = 1 }) {
  const w = Math.round(120 * scale)
  const h = Math.round(135 * scale)
  return (
    <svg
      width={w} height={h} viewBox="0 0 120 135"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: 'cr-bob 3s ease-in-out infinite' }}
    >
      {/* Floating ? marks */}
      <text x="12" y="30" fontSize="16" fontWeight="bold" fill="#e53935" opacity="0.55"
        style={floatStyle(0)}>?</text>
      <text x="92" y="23" fontSize="11" fontWeight="bold" fill="#ffb3b3"
        style={floatStyle(0.9)}>?</text>

      {/* Shadow */}
      <ellipse cx="60" cy="132" rx="32" ry="5" fill="#e5393425" />

      {/* Body */}
      <path d="M60,8 C60,8 98,38 98,72 C98,94 81,110 60,110 C39,110 22,94 22,72 C22,38 60,8 60,8 Z" fill="#e53935" />
      <path d="M60,8 C60,8 94,36 94,70 C94,92 78,107 60,107 C42,107 26,92 26,70 C26,36 60,8 60,8 Z" fill="#ef5350" />
      <ellipse cx="46" cy="48" rx="9" ry="13" fill="rgba(255,255,255,0.26)" transform="rotate(-20 46 48)" />

      {/* Arms raised (shrug pose) */}
      <rect x="8"  y="72" width="16" height="11" rx="5.5" fill="#e53935" transform="rotate(-65 8 72)" />
      <rect x="96" y="72" width="16" height="11" rx="5.5" fill="#e53935" transform="rotate(65 112 72)" />

      {/* Raised eyebrows */}
      <path d="M36,62 Q43,56 50,62" stroke="#c62828" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M70,62 Q77,56 84,62" stroke="#c62828" strokeWidth="2.2" fill="none" strokeLinecap="round" />

      {/* Eye whites */}
      <ellipse cx="42" cy="74" rx="9.5" ry="11" fill="white" />
      <ellipse cx="78" cy="74" rx="9.5" ry="11" fill="white" />

      {/* Pupils shifted upward (questioning look) */}
      <circle cx="42" cy="71" r="6" fill="#1a1a1a" />
      <circle cx="78" cy="71" r="6" fill="#1a1a1a" />
      <circle cx="44" cy="69" r="2.2" fill="white" />
      <circle cx="80" cy="69" r="2.2" fill="white" />

      {/* Cheeks */}
      <ellipse cx="31" cy="86" rx="7" ry="4.5" fill="#ff8a80" opacity="0.42" />
      <ellipse cx="89" cy="86" rx="7" ry="4.5" fill="#ff8a80" opacity="0.42" />

      {/* Slight frown */}
      <path d="M53,92 Q60,88 67,92" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export default function EmptyState({ title, description, size = 'md', className }) {
  if (size === 'xs') {
    return (
      <div className={className ?? 'flex flex-col items-center justify-center py-3 text-center'}>
        <p className="text-sm text-gray-400">{title}</p>
      </div>
    )
  }

  if (size === 'sm') {
    return (
      <div className={className ?? 'flex flex-col items-center justify-center py-5 text-center select-none'}>
        <div className="mb-2">
          <EmptyMascot scale={0.65} />
        </div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5 max-w-xs">{description}</p>}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={className ?? 'flex flex-col items-center justify-center py-10 text-center select-none'}
    >
      <div className="mb-5">
        <EmptyMascot />
      </div>
      <p className="font-semibold text-gray-600">{title}</p>
      {description && <p className="text-sm text-gray-400 mt-1 max-w-xs">{description}</p>}
    </motion.div>
  )
}
