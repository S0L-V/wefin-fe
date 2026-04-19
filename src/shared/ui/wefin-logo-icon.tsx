interface WefinLogoIconProps {
  size?: number
  className?: string
}

export default function WefinLogoIcon({ size = 16, className = '' }: WefinLogoIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M2 6C2 6 3.5 6 5 13C6.5 20 7.5 20 9 13C10.5 6 11 6 11.5 6C12 6 13 6 14 14C15 22 16.5 20 18 13C19.5 6 22 5 22 5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="22" cy="5" r="1.5" fill="currentColor" />
    </svg>
  )
}
