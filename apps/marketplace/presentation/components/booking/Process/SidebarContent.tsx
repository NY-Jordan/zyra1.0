import React from 'react'
import { CheckCircle, Circle, Trash2 } from 'lucide-react'
import { Booking } from '../../../../app/booking/[id]/types'

interface SidebarContentProps {
  multipleBookings: Booking[]
  currentPersonIndex: number
  currentStep: number
  onSelectBooking: (index: number) => void
  onDeleteBooking: (index: number) => void
}

export const SidebarContent: React.FC<SidebarContentProps> = ({
  multipleBookings,
  currentPersonIndex,
  currentStep,
  onSelectBooking,
  onDeleteBooking,
}) => (
  <div className="space-y-3">
    {multipleBookings.map((booking, idx) => (
      <div
        key={idx}
        onClick={() => {
          if (currentStep !== 7 || currentPersonIndex !== idx) {
            onSelectBooking(idx)
          }
        }}
        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
          currentPersonIndex === idx && currentStep !== 7
            ? 'border-gray-900 bg-gray-100 shadow-md'
            : booking.service
            ? 'border-gray-900 bg-gray-50'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {booking.service ? (
                <CheckCircle className="h-4 w-4 text-gray-900 flex-shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />
              )}
              <p className="font-semibold text-sm">Personne {idx + 1}</p>
            </div>
            {booking.service ? (
              <div className="text-xs text-gray-600 mt-1 space-y-1 ml-6">
                <p className="font-medium truncate">{booking.service.name}</p>
                {booking.supplements.length > 0 && (
                  <p className="text-gray-500">+{booking.supplements.length} supplément(s)</p>
                )}
                {booking.hairdresser && (
                  <p className="text-gray-500 truncate">Coiffeur sélectionné</p>
                )}
                {booking.date && booking.time && (
                  <p className="text-gray-900 font-medium">
                    {booking.date.toLocaleDateString('fr-FR')} à {booking.time}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-1 ml-6">Non complétée</p>
            )}
          </div>
          {booking.service && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDeleteBooking(idx)
              }}
              className="text-red-500 hover:text-red-700 flex-shrink-0 p-1"
              title="Supprimer cette réservation"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    ))}
  </div>
)
