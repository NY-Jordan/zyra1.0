import React from 'react'

interface LoadingSpinnerProps {
  message?: string
}

export default function LoadingSpinner({ message = "Chargement..." }: LoadingSpinnerProps) {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-100 border-t-emerald-600" />
        {message && <p className="mt-4 text-gray-500">{message}</p>}
      </div>
    </div>
  )
}