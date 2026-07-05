import React from 'react'
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
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="lg:col-span-2">
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sticky top-20">
        <p className="text-[13px] font-bold text-gray-700 mb-4">Résumé</p>

        <div className="max-h-96 overflow-y-auto pr-1 space-y-1">
          <SidebarContent
            multipleBookings={multipleBookings}
            currentPersonIndex={currentPersonIndex}
            currentStep={currentStep}
            onSelectBooking={onSelectBooking}
            onDeleteBooking={onDeleteBooking}
          />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-gray-600">Réservations</span>
            <span className="text-[12px] font-bold text-gray-900">{completedCount}/{totalCount}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-gray-900 h-1.5 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
