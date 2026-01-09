import React from 'react'
import { ShoppingCart } from 'lucide-react'
import { Booking } from '../../../../app/booking/[id]/types'
import { SidebarContent } from './SidebarContent'

interface DesktopSidebarProps {
  multipleBookings: Booking[]
  currentPersonIndex: number
  currentStep: number
  onSelectBooking: (index: number) => void
  onDeleteBooking: (index: number) => void
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  multipleBookings,
  currentPersonIndex,
  currentStep,
  onSelectBooking,
  onDeleteBooking,
}) => {
  const completedCount = multipleBookings.filter(b => b.service).length
  const totalCount = multipleBookings.length
  const progressPercentage = (completedCount / totalCount) * 100

  return (
    <div className="lg:col-span-2">
      <div className="bg-white rounded-lg shadow p-4 sticky top-8">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <span>📋</span> Résumé
        </h3>

        <div className="max-h-96 overflow-y-auto pr-2">
          <SidebarContent
            multipleBookings={multipleBookings}
            currentPersonIndex={currentPersonIndex}
            currentStep={currentStep}
            onSelectBooking={onSelectBooking}
            onDeleteBooking={onDeleteBooking}
          />
        </div>

        <div className="mt-6 pt-4 border-t space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Réservations</span>
            <span className="text-sm font-bold text-blue-600">
              {completedCount}/{totalCount}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
