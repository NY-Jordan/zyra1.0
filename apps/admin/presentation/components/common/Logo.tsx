import React from 'react'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

const markSizes = { sm: 20, md: 24, lg: 30 }
const textSizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' }

export function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  const s = markSizes[size]
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M6 7H26L6 25H26"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showText && (
        <div>
          <span className={`font-semibold text-white tracking-[0.12em] uppercase leading-none ${textSizes[size]}`}>
            Zyra
          </span>
          <div className="text-white/25 text-[9px] tracking-[0.25em] uppercase leading-none mt-0.5">
            Administration
          </div>
        </div>
      )}
    </div>
  )
}
