'use client'
import React from 'react'

interface LoadingScreenProps {
  message?: string
  className?: string
}

export default function LoadingScreen({ 
  message = "Chargement...", 
  className = "" 
}: LoadingScreenProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 ${className}`}>
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600" />
        <p className="mt-4 text-gray-500 dark:text-gray-400">{message}</p>
      </div>
    </div>
  )
}
