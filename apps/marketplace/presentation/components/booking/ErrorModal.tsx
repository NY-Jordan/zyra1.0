'use client'

import React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@zyra/ui/components/alert'
import { Button } from '@zyra/ui/components/button'
import { AlertCircle } from 'lucide-react'

interface ErrorModalProps {
  show: boolean
  message: string
  reason: string
  onClose: () => void
}

export default function ErrorModal({ show, message, reason, onClose }: ErrorModalProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <Alert variant="destructive" className="m-0 border-b-0 rounded-b-none p-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="mt-2">{message}</AlertTitle>
          <AlertDescription className="mt-3 mb-4">
            {reason}
          </AlertDescription>
        </Alert>
        <Button
          onClick={onClose}
          variant="destructive"
          className="w-full mt-4"
        >
          Comprendre
        </Button>
      </div>
    </div>
  )
}
