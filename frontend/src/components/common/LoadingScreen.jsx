const SUBTITLES = {
  general:        "Monitoring Singapore's blood supply...",
  allocation:     'Finding the best route...',
  forecasting:    'Analysing trends and demand...',
  recommendation: 'Analysing data and suggesting actions...',
}

/* ── shared blink style (scaleY around element centre) ── */
const blinkStyle = (dur, delay = 0) => ({
  animation: `cr-blink ${dur}s ease-in-out ${delay}s infinite`,
  transformBox: 'fill-box',
  transformOrigin: 'center',
})

/* ── 1. General – bobbing drop with hearts ── */
function GeneralIllustration() {
  return (
    <svg
      width="120" height="135" viewBox="0 0 120 135"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: 'cr-bob 2s ease-in-out infinite' }}
    >
      <text x="10" y="36" fontSize="13" fill="#e53935"
        style={{ animation: 'cr-heartpop 1.5s ease-in-out 0s infinite', transformBox: 'fill-box', transformOrigin: 'center' }}>♥</text>
      <text x="96" y="28" fontSize="10" fill="#ffb3b3"
        style={{ animation: 'cr-heartpop 1.5s ease-in-out 0.6s infinite', transformBox: 'fill-box', transformOrigin: 'center' }}>♥</text>

      <ellipse cx="60" cy="132" rx="32" ry="5" fill="#e5393425" />
      <path d="M60,8 C60,8 98,38 98,72 C98,94 81,110 60,110 C39,110 22,94 22,72 C22,38 60,8 60,8 Z" fill="#e53935" />
      <path d="M60,8 C60,8 94,36 94,70 C94,92 78,107 60,107 C42,107 26,92 26,70 C26,36 60,8 60,8 Z" fill="#ef5350" />
      <ellipse cx="46" cy="48" rx="9" ry="13" fill="rgba(255,255,255,0.26)" transform="rotate(-20 46 48)" />
      <ellipse cx="41" cy="45" rx="4" ry="6"  fill="rgba(255,255,255,0.16)" transform="rotate(-20 41 45)" />

      <rect x="8"  y="72" width="16" height="11" rx="5.5" fill="#e53935" transform="rotate(-30 8 72)" />
      <rect x="96" y="72" width="16" height="11" rx="5.5" fill="#e53935" transform="rotate(30 96 72)" />

      <ellipse cx="42" cy="74" rx="9.5" ry="11" fill="white" />
      <ellipse cx="78" cy="74" rx="9.5" ry="11" fill="white" />
      <circle cx="43" cy="76" r="6" fill="#1a1a1a" style={blinkStyle(3.2)} />
      <circle cx="79" cy="76" r="6" fill="#1a1a1a" style={blinkStyle(3.2, 0.15)} />
      <circle cx="45" cy="73" r="2.2" fill="white" />
      <circle cx="81" cy="73" r="2.2" fill="white" />

      <ellipse cx="32" cy="86" rx="7" ry="4.5" fill="#ff8a80" opacity="0.42" />
      <ellipse cx="88" cy="86" rx="7" ry="4.5" fill="#ff8a80" opacity="0.42" />
      <path d="M53,87 Q60,93 67,87" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

/* ── 2. Allocation – running drop with arm swing ── */
function AllocationIllustration() {
  return (
    <svg
      width="120" height="135" viewBox="0 0 120 135"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: 'cr-run 1s ease-in-out infinite' }}
    >
      <ellipse cx="60" cy="132" rx="32" ry="5" fill="#e5393425" />
      <path d="M60,8 C60,8 98,38 98,72 C98,94 81,110 60,110 C39,110 22,94 22,72 C22,38 60,8 60,8 Z" fill="#e53935" />
      <path d="M60,8 C60,8 94,36 94,70 C94,92 78,107 60,107 C42,107 26,92 26,70 C26,36 60,8 60,8 Z" fill="#ef5350" />
      <ellipse cx="46" cy="48" rx="9" ry="13" fill="rgba(255,255,255,0.26)" transform="rotate(-20 46 48)" />

      <g style={{ transformOrigin: '22px 70px', animation: 'cr-armswing-l 0.5s ease-in-out infinite' }}>
        <rect x="6" y="65" width="18" height="11" rx="5.5" fill="#e53935" transform="rotate(-20 6 65)" />
      </g>
      <g style={{ transformOrigin: '98px 70px', animation: 'cr-armswing-r 0.5s ease-in-out infinite' }}>
        <rect x="96" y="65" width="18" height="11" rx="5.5" fill="#e53935" transform="rotate(20 96 65)" />
      </g>

      <ellipse cx="42" cy="74" rx="9.5" ry="11" fill="white" />
      <ellipse cx="78" cy="74" rx="9.5" ry="11" fill="white" />
      <circle cx="43" cy="76" r="6" fill="#1a1a1a" />
      <circle cx="79" cy="76" r="6" fill="#1a1a1a" />
      <circle cx="45" cy="73" r="2.2" fill="white" />
      <circle cx="81" cy="73" r="2.2" fill="white" />

      <ellipse cx="32" cy="86" rx="7" ry="4.5" fill="#ff8a80" opacity="0.42" />
      <ellipse cx="88" cy="86" rx="7" ry="4.5" fill="#ff8a80" opacity="0.42" />
      <path d="M53,87 Q60,93 67,87" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Motion lines */}
      <line x1="2"  y1="64" x2="14" y2="64" stroke="#e5393555" strokeWidth="2" strokeLinecap="round" />
      <line x1="0"  y1="74" x2="10" y2="74" stroke="#e5393540" strokeWidth="2" strokeLinecap="round" />
      <line x1="3"  y1="84" x2="12" y2="84" stroke="#e5393530" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/* ── 3. Forecasting – bobbing drop with magnifier arm ── */
function ForecastingIllustration() {
  return (
    <svg
      width="130" height="145" viewBox="0 0 130 145"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: 'cr-bob 2.4s ease-in-out infinite' }}
    >
      <ellipse cx="62" cy="138" rx="32" ry="5" fill="#e5393425" />
      <path d="M62,8 C62,8 100,38 100,72 C100,94 83,110 62,110 C41,110 24,94 24,72 C24,38 62,8 62,8 Z" fill="#e53935" />
      <path d="M62,8 C62,8 96,36 96,70 C96,92 80,107 62,107 C44,107 28,92 28,70 C28,36 62,8 62,8 Z" fill="#ef5350" />
      <ellipse cx="48" cy="48" rx="9" ry="13" fill="rgba(255,255,255,0.26)" transform="rotate(-20 48 48)" />

      {/* Left arm static */}
      <rect x="10" y="72" width="16" height="11" rx="5.5" fill="#e53935" transform="rotate(-30 10 72)" />

      {/* Right arm + magnifier, swinging together */}
      <g style={{ transformOrigin: '100px 72px', animation: 'cr-magswing 1.8s ease-in-out infinite' }}>
        <rect x="98" y="67" width="16" height="11" rx="5.5" fill="#e53935" transform="rotate(15 98 67)" />
        <circle cx="116" cy="90" r="15" fill="none" stroke="#c62828" strokeWidth="3.5" />
        <circle cx="116" cy="90" r="10" fill="rgba(200,230,255,0.2)" />
        <line x1="127" y1="101" x2="138" y2="114" stroke="#c62828" strokeWidth="4" strokeLinecap="round" />
      </g>

      <ellipse cx="44" cy="74" rx="9.5" ry="11" fill="white" />
      <ellipse cx="80" cy="74" rx="9.5" ry="11" fill="white" />
      {/* Left eye normal */}
      <circle cx="45" cy="76" r="6" fill="#1a1a1a" />
      <circle cx="47" cy="73" r="2.2" fill="white" />
      {/* Right eye wink */}
      <path d="M72,72 Q80,68 88,72" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      <ellipse cx="34" cy="86" rx="7" ry="4.5" fill="#ff8a80" opacity="0.42" />
      <ellipse cx="90" cy="86" rx="7" ry="4.5" fill="#ff8a80" opacity="0.42" />
      <path d="M55,87 Q62,93 69,87" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

/* ── 4. Recommendation – robot drop with laptop ── */
function RecommendationIllustration() {
  return (
    <svg
      width="120" height="158" viewBox="0 0 120 158"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: 'cr-typebounce 1s ease-in-out infinite' }}
    >
      <ellipse cx="60" cy="132" rx="32" ry="5" fill="#e5393425" />
      <path d="M60,8 C60,8 98,38 98,72 C98,94 81,110 60,110 C39,110 22,94 22,72 C22,38 60,8 60,8 Z" fill="#c62828" />
      <path d="M60,8 C60,8 94,36 94,70 C94,92 78,107 60,107 C42,107 26,92 26,70 C26,36 60,8 60,8 Z" fill="#d32f2f" />
      <ellipse cx="46" cy="48" rx="9" ry="13" fill="rgba(255,255,255,0.18)" transform="rotate(-20 46 48)" />

      <rect x="8"  y="72" width="16" height="11" rx="5.5" fill="#c62828" transform="rotate(-30 8 72)" />
      <rect x="96" y="72" width="16" height="11" rx="5.5" fill="#c62828" transform="rotate(30 96 72)" />

      {/* Visor */}
      <rect x="28" y="64" width="64" height="24" rx="12" fill="#0d0d1f" />
      <rect x="34" y="69" width="18" height="12" rx="4" fill="#00e5cc" style={blinkStyle(3.5)} />
      <rect x="68" y="69" width="18" height="12" rx="4" fill="#00e5cc" style={blinkStyle(3.5, 0.25)} />

      <ellipse cx="32" cy="94" rx="7" ry="4.5" fill="#ff8a80" opacity="0.28" />
      <ellipse cx="88" cy="94" rx="7" ry="4.5" fill="#ff8a80" opacity="0.28" />

      {/* Laptop */}
      <rect x="22" y="118" width="76" height="34" rx="5" fill="#d0d0d0" />
      <rect x="27" y="122" width="66" height="26" rx="3" fill="#e8e8e8" />
      <text x="60" y="139" textAnchor="middle" fontSize="13" fontWeight="700" fill="#e53935">AI</text>
      <rect x="14" y="152" width="92" height="7"  rx="3" fill="#bdbdbd" />
    </svg>
  )
}

/* ── LoadingScreen ── */
export default function LoadingScreen({ variant = 'general' }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[480px] select-none">
      <div className="mb-8">
        {variant === 'general'        && <GeneralIllustration />}
        {variant === 'allocation'     && <AllocationIllustration />}
        {variant === 'forecasting'    && <ForecastingIllustration />}
        {variant === 'recommendation' && <RecommendationIllustration />}
      </div>
      <div className="flex items-baseline mb-3">
        <span className="text-2xl font-bold tracking-tight text-gray-900">code</span>
        <span className="text-2xl font-bold tracking-tight text-red-600">RED</span>
      </div>
      <div className="w-52 h-1.5 bg-gray-100 rounded-full mb-2.5 overflow-hidden">
        <div
          className="h-full rounded-full bg-red-500"
          style={{ width: '10%', animation: 'cr-progress 1.5s ease-in-out infinite alternate' }}
        />
      </div>
      <p className="text-sm text-gray-400">{SUBTITLES[variant]}</p>
    </div>
  )
}
