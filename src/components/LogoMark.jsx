/**
 * 앱 헤더·브랜딩용 로고 (favicon.svg와 동일 컨셉)
 */
export default function LogoMark({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ flexShrink: 0, display: 'block' }}
    >
      <defs>
        <linearGradient id="logo-bg" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="35%" stopColor="#ec4899" />
          <stop offset="70%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <radialGradient id="logo-glow" cx="50%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="logo-glyph" x1="8" y1="8" x2="24" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fecaca" />
          <stop offset="35%" stopColor="#fef08a" />
          <stop offset="65%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#c4b5fd" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#logo-bg)" />
      <rect width="32" height="32" rx="8" fill="url(#logo-glow)" />
      <text
        x="16"
        y="23.5"
        textAnchor="middle"
        fontSize="18"
        fontWeight="800"
        fill="url(#logo-glyph)"
        fontFamily="system-ui, 'Segoe UI', sans-serif"
      >
        가
      </text>
    </svg>
  );
}
