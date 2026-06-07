const SUBTITLES = {
  general:           "Monitoring Singapore's blood supply...",
  allocation:        'Finding the best route...',
  forecasting:       'Analysing trends and demand...',
  recommendation:    'Analysing data and suggesting actions...',
  donorOutreach:     'Reaching out to donors...',
  donorInformation:  'Loading donor profiles...',
  donationDrives:    'Loading donation drives...',
  alerts:            'Checking urgent alerts...',
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
      width="155" height="145" viewBox="0 0 155 145"
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

/* ── 5. Donor Outreach – bobbing drop with floating envelopes and waving arm ── */
function DonorOutreachIllustration() {
  return (
    <svg
      width="145" height="135" viewBox="0 0 145 135"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: 'cr-bob 2s ease-in-out infinite' }}
    >
      <ellipse cx="60" cy="132" rx="32" ry="5" fill="#e5393425" />
      <path d="M60,8 C60,8 98,38 98,72 C98,94 81,110 60,110 C39,110 22,94 22,72 C22,38 60,8 60,8 Z" fill="#e53935" />
      <path d="M60,8 C60,8 94,36 94,70 C94,92 78,107 60,107 C42,107 26,92 26,70 C26,36 60,8 60,8 Z" fill="#ef5350" />
      <ellipse cx="46" cy="48" rx="9" ry="13" fill="rgba(255,255,255,0.26)" transform="rotate(-20 46 48)" />
      <rect x="8" y="72" width="16" height="11" rx="5.5" fill="#e53935" transform="rotate(-30 8 72)" />
      <g style={{ transformOrigin: '96px 66px', animation: 'cr-wave 1s ease-in-out infinite' }}>
        <rect x="96" y="61" width="16" height="11" rx="5.5" fill="#e53935" transform="rotate(-35 96 61)" />
      </g>
      <g style={{ animation: 'cr-float 1.6s ease-in-out 0s infinite' }}>
        <rect x="108" y="22" width="30" height="21" rx="3" fill="#ffcdd2" stroke="#ef9a9a" strokeWidth="0.5" />
        <path d="M108,22 L123,32 L138,22" stroke="#e53935" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </g>
      <g style={{ animation: 'cr-float 1.6s ease-in-out 0.55s infinite' }}>
        <rect x="114" y="52" width="26" height="18" rx="3" fill="#ffcdd2" stroke="#ef9a9a" strokeWidth="0.5" />
        <path d="M114,52 L127,60 L140,52" stroke="#e53935" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </g>
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

/* ── 6. Donor Information – bobbing drop holding clipboard ── */
function DonorInformationIllustration() {
  return (
    <svg
      width="145" height="135" viewBox="0 0 145 135"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: 'cr-bob 2.3s ease-in-out infinite' }}
    >
      <ellipse cx="60" cy="132" rx="32" ry="5" fill="#e5393425" />
      <path d="M60,8 C60,8 98,38 98,72 C98,94 81,110 60,110 C39,110 22,94 22,72 C22,38 60,8 60,8 Z" fill="#e53935" />
      <path d="M60,8 C60,8 94,36 94,70 C94,92 78,107 60,107 C42,107 26,92 26,70 C26,36 60,8 60,8 Z" fill="#ef5350" />
      <ellipse cx="46" cy="48" rx="9" ry="13" fill="rgba(255,255,255,0.26)" transform="rotate(-20 46 48)" />
      <rect x="8"  y="68" width="16" height="11" rx="5.5" fill="#e53935" transform="rotate(20 8 68)" />
      <rect x="96" y="68" width="16" height="11" rx="5.5" fill="#e53935" transform="rotate(-20 96 68)" />
      <rect x="98" y="44" width="44" height="56" rx="4" fill="#f5f5f5" stroke="#d0d0d0" strokeWidth="1" />
      <rect x="111" y="40" width="18" height="9" rx="4" fill="#bdbdbd" />
      <rect x="103" y="56" width="34" height="3" rx="1.5" fill="#e0e0e0" />
      <rect x="103" y="65" width="28" height="3" rx="1.5" fill="#e0e0e0" />
      <rect x="103" y="74" width="32" height="3" rx="1.5" fill="#e0e0e0" />
      <rect x="103" y="83" width="22" height="3" rx="1.5" fill="#e0e0e0" />
      <circle cx="106" cy="57" r="2.5" fill="#e53935" />
      <circle cx="106" cy="66" r="2.5" fill="#e53935" />
      <circle cx="106" cy="75" r="2.5" fill="#e53935" />
      <ellipse cx="42" cy="74" rx="9.5" ry="11" fill="white" />
      <ellipse cx="78" cy="74" rx="9.5" ry="11" fill="white" />
      <circle cx="43" cy="76" r="6" fill="#1a1a1a" style={blinkStyle(3.2)} />
      <circle cx="79" cy="76" r="6" fill="#1a1a1a" style={blinkStyle(3.2, 0.2)} />
      <circle cx="45" cy="73" r="2.2" fill="white" />
      <circle cx="81" cy="73" r="2.2" fill="white" />
      <ellipse cx="32" cy="86" rx="7" ry="4.5" fill="#ff8a80" opacity="0.42" />
      <ellipse cx="88" cy="86" rx="7" ry="4.5" fill="#ff8a80" opacity="0.42" />
      <path d="M53,87 Q60,93 67,87" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

/* ── 7. Donation Drives – bobbing drop waving a flag ── */
function DonationDrivesIllustration() {
  return (
    <svg
      width="145" height="135" viewBox="0 0 145 135"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: 'cr-bob 1.8s ease-in-out infinite' }}
    >
      <ellipse cx="60" cy="132" rx="32" ry="5" fill="#e5393425" />
      <circle cx="18"  cy="18" r="3.5" fill="#ffcdd2" style={{ animation: 'cr-float 1.6s ease-in-out 0s infinite' }} />
      <circle cx="128" cy="14" r="3"   fill="#ef9a9a"  style={{ animation: 'cr-float 1.6s ease-in-out 0.3s infinite' }} />
      <rect   x="12"   y="48" width="5" height="5" rx="1" fill="#ffb3b3" style={{ animation: 'cr-float 1.6s ease-in-out 0.7s infinite' }} />
      <circle cx="134" cy="48" r="3"   fill="#ffcdd2" style={{ animation: 'cr-float 1.6s ease-in-out 0.5s infinite' }} />
      <path d="M60,8 C60,8 98,38 98,72 C98,94 81,110 60,110 C39,110 22,94 22,72 C22,38 60,8 60,8 Z" fill="#e53935" />
      <path d="M60,8 C60,8 94,36 94,70 C94,92 78,107 60,107 C42,107 26,92 26,70 C26,36 60,8 60,8 Z" fill="#ef5350" />
      <ellipse cx="46" cy="48" rx="9" ry="13" fill="rgba(255,255,255,0.26)" transform="rotate(-20 46 48)" />
      <rect x="8" y="72" width="16" height="11" rx="5.5" fill="#e53935" transform="rotate(-30 8 72)" />
      <g style={{ transformOrigin: '96px 60px', animation: 'cr-wave 0.85s ease-in-out infinite' }}>
        <rect x="96" y="55" width="16" height="11" rx="5.5" fill="#e53935" transform="rotate(-45 96 55)" />
        <line x1="108" y1="42" x2="108" y2="14" stroke="#c62828" strokeWidth="2.5" strokeLinecap="round" />
        <g style={{ transformOrigin: '108px 14px', animation: 'cr-flagwave 0.85s ease-in-out infinite' }}>
          <path d="M108,14 L130,20 L108,26 Z" fill="#e53935" />
        </g>
      </g>
      <ellipse cx="42" cy="74" rx="9.5" ry="11" fill="white" />
      <ellipse cx="78" cy="74" rx="9.5" ry="11" fill="white" />
      <circle cx="43" cy="76" r="6" fill="#1a1a1a" style={blinkStyle(3.2)} />
      <circle cx="79" cy="76" r="6" fill="#1a1a1a" style={blinkStyle(3.2, 0.15)} />
      <circle cx="45" cy="73" r="2.2" fill="white" />
      <circle cx="81" cy="73" r="2.2" fill="white" />
      <ellipse cx="32" cy="86" rx="7" ry="4.5" fill="#ff8a80" opacity="0.42" />
      <ellipse cx="88" cy="86" rx="7" ry="4.5" fill="#ff8a80" opacity="0.42" />
      <path d="M50,86 Q60,96 70,86" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

/* ── 8. Alerts – shaking drop with bell hat and pulse rings ── */
function AlertsIllustration() {
  const pulseStyle = (delay = 0) => ({
    animation: `cr-pulse-ring 1.4s ease-out ${delay}s infinite`,
    transformBox: 'fill-box',
    transformOrigin: 'center',
  })
  return (
    <svg
      width="120" height="148" viewBox="0 0 120 148"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: 'cr-shake 1.1s ease-in-out infinite' }}
    >
      <circle cx="60" cy="68" r="44" fill="none" stroke="#e5393528" strokeWidth="2" style={pulseStyle(0)} />
      <circle cx="60" cy="68" r="52" fill="none" stroke="#e5393518" strokeWidth="2" style={pulseStyle(0.3)} />
      <ellipse cx="60" cy="144" rx="32" ry="5" fill="#c6282820" />
      <path d="M46,14 Q60,2 74,14 L76,28 Q60,33 44,28 Z" fill="#ffb300" />
      <rect x="54" y="28" width="12" height="6" rx="2.5" fill="#ff8f00" />
      <circle cx="60" cy="34" r="4" fill="#ff6f00" />
      <line x1="53" y1="18" x2="50" y2="24" stroke="#ff8f00" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="67" y1="18" x2="70" y2="24" stroke="#ff8f00" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M60,36 C60,36 98,62 98,90 C98,112 81,128 60,128 C39,128 22,112 22,90 C22,62 60,36 60,36 Z" fill="#c62828" />
      <path d="M60,36 C60,36 94,60 94,88 C94,110 78,125 60,125 C42,125 26,110 26,88 C26,60 60,36 60,36 Z" fill="#d32f2f" />
      <ellipse cx="46" cy="62" rx="9" ry="13" fill="rgba(255,255,255,0.18)" transform="rotate(-20 46 62)" />
      <rect x="4"  y="82" width="20" height="11" rx="5.5" fill="#c62828" transform="rotate(-50 4 82)" />
      <rect x="96" y="82" width="20" height="11" rx="5.5" fill="#c62828" transform="rotate(50 96 82)" />
      <ellipse cx="42" cy="92" rx="9.5" ry="11" fill="white" />
      <ellipse cx="78" cy="92" rx="9.5" ry="11" fill="white" />
      <circle cx="43" cy="94" r="6" fill="#1a1a1a" style={blinkStyle(0.9)} />
      <circle cx="79" cy="94" r="6" fill="#1a1a1a" style={blinkStyle(0.9, 0.1)} />
      <circle cx="45" cy="91" r="2.2" fill="white" />
      <circle cx="81" cy="91" r="2.2" fill="white" />
      <path d="M35,84 Q42,80 48,83" stroke="#c62828" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M72,83 Q78,80 85,84" stroke="#c62828" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="32" cy="103" rx="7" ry="4.5" fill="#ff8a80" opacity="0.35" />
      <ellipse cx="88" cy="103" rx="7" ry="4.5" fill="#ff8a80" opacity="0.35" />
      <path d="M53,107 Q60,103 67,107" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

/* ── SectionLoader — inline AI regeneration loader ── */
export function SectionLoader({ variant = 'recommendation', message }) {
  return (
    <div className="flex flex-col items-center justify-center py-4 gap-2 select-none">
      <div style={{ height: 100, overflow: 'hidden' }}>
        <div style={{ transform: 'scale(0.65)', transformOrigin: 'top center' }}>
          {variant === 'forecasting'    && <ForecastingIllustration />}
          {variant === 'donorOutreach'  && <DonorOutreachIllustration />}
          {variant === 'recommendation' && <RecommendationIllustration />}
        </div>
      </div>
      {message && <p className="text-xs text-gray-400">{message}</p>}
    </div>
  )
}

/* ── LoadingScreen ── */
export default function LoadingScreen({ variant = 'general' }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[480px] select-none">
      <div className="mb-8">
        {variant === 'general'           && <GeneralIllustration />}
        {variant === 'allocation'        && <AllocationIllustration />}
        {variant === 'forecasting'       && <ForecastingIllustration />}
        {variant === 'recommendation'    && <RecommendationIllustration />}
        {variant === 'donorOutreach'     && <DonorOutreachIllustration />}
        {variant === 'donorInformation'  && <DonorInformationIllustration />}
        {variant === 'donationDrives'    && <DonationDrivesIllustration />}
        {variant === 'alerts'            && <AlertsIllustration />}
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
