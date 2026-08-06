import type { ReactNode } from 'react'
import { Reveal } from './Reveal'

/** Highlights a word/phrase within a heading using the brand green. */
export function Accent({ children }: { children: ReactNode }) {
  return <span className="text-[#16A34A] dark:text-emerald-400">{children}</span>
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
}: {
  eyebrow?: string
  title: ReactNode
  description?: string
  align?: 'center' | 'left'
}) {
  return (
    <Reveal className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-xl text-left'}>
      {eyebrow ? (
        <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#16A34A] dark:text-emerald-400">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 font-[family-name:var(--font-heading)] text-[36px] font-extrabold leading-[1.15] tracking-tight text-slate-900 dark:text-white sm:text-[46px]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-[17px] leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
      ) : null}
    </Reveal>
  )
}
