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
        <linearGradient id="logo-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        <radialGradient id="logo-glow" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#logo-bg)" />
      <rect width="32" height="32" rx="8" fill="url(#logo-glow)" />
      <text
        x="16"
        y="23.5"
        textAnchor="middle"
        fontSize="18"
        fontWeight="800"
        fill="#ffffff"
        fontFamily="system-ui, 'Segoe UI', sans-serif"
      >
        가
      </text>
    </svg>
  );
}
