'use client'

import NextTopLoader from 'nextjs-toploader'
import { useTheme } from 'next-themes'

export function ThemedTopLoader() {
  const { resolvedTheme } = useTheme()
  const color = resolvedTheme === 'dark' ? '#e4e4e7' : '#18181b'

  return <NextTopLoader color={color} showSpinner={false} />
}
