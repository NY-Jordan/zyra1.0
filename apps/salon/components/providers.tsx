'use client'

import { Toaster } from 'sonner'
import { ThemeProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { ThemedTopLoader } from './ThemedTopLoader'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes
            retry: (failureCount: number, error: any) => {
              // Don't retry on 4xx errors
              if (error?.status >= 400 && error?.status < 500) {
                return false
              }
              return failureCount < 3
            },
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ThemedTopLoader />
        {children}
        <Toaster
          position="top-right"
          gap={8}
          toastOptions={{
            classNames: {
              toast: [
                'group',
                '!bg-white dark:!bg-[#161B24]',
                '!border !border-[#F0EAE4] dark:!border-slate-800/60',
                '!rounded-2xl',
                '!shadow-lg !shadow-black/[0.06] dark:!shadow-black/30',
                '!text-[13px] !font-medium',
                '!px-4 !py-3.5',
              ].join(' '),
              title: '!font-semibold !text-slate-800 dark:!text-white !text-[13px] !leading-snug',
              description: '!text-[12px] !text-slate-500 dark:!text-slate-400 !leading-normal',
              success: '!border-l-[3px] !border-l-emerald-400 dark:!border-l-emerald-500',
              error: '!border-l-[3px] !border-l-rose-400 dark:!border-l-rose-500',
              warning: '!border-l-[3px] !border-l-amber-400 dark:!border-l-amber-500',
              info: '!border-l-[3px] !border-l-sky-400 dark:!border-l-sky-500',
              closeButton: [
                '!bg-[#F5F2EF] dark:!bg-slate-800',
                '!border !border-[#E8E0D8] dark:!border-slate-700',
                '!text-slate-500 dark:!text-slate-400',
                '!rounded-lg',
                'hover:!bg-[#EDE8E4] dark:hover:!bg-slate-700',
              ].join(' '),
              actionButton: '!bg-emerald-500 !text-white !rounded-xl !font-semibold hover:!bg-emerald-600',
              cancelButton: '!bg-[#F5F2EF] dark:!bg-slate-800 !text-slate-600 dark:!text-slate-400 !rounded-xl !font-semibold',
            },
          }}
        />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
