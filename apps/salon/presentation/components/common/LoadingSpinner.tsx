import React from 'react'

interface LoadingSpinnerProps {
  message?: string
}

export default function LoadingSpinner({ message = "Chargement..." }: LoadingSpinnerProps) {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-white dark:bg-slate-950">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-100 dark:border-slate-700 border-t-emerald-600 dark:border-t-emerald-400" />
        {message && <p className="mt-4 text-gray-500 dark:text-slate-400">{message}</p>}
      </div>
    </div>
  )
}