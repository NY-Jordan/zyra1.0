import React from 'react'
import { Card, CardContent } from '@zyra/ui/components/card'

export default function SalonCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Image skeleton */}
      <div className="h-48 w-full bg-gray-200 animate-pulse" />

      <CardContent className="p-4 space-y-3">
        {/* Nom et note */}
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        </div>

        {/* Adresse */}
        <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />

        {/* Services */}
        <div className="pt-2 border-t space-y-2">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
          <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2" />
        </div>

        {/* Horaires */}
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
      </CardContent>
    </Card>
  )
}
