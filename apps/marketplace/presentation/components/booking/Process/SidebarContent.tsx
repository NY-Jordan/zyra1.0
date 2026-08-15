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
          if (currentStep !== 6 || currentPersonIndex !== idx) {
            onSelectBooking(idx)
          }
        }}
        className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
          currentPersonIndex === idx && currentStep !== 6
            ? 'border-emerald-500 bg-emerald-50 shadow-md'
            : booking.service
            ? 'border-emerald-500 bg-slate-50 hover:shadow-[0_4px_16px_rgba(15,23,42,0.08)]'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(15,23,42,0.08)]'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {booking.service ? (
                <CheckCircle className="h-4 w-4 text-slate-900 flex-shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-slate-300 flex-shrink-0" />
              )}
              <p className="font-semibold text-sm">Personne {idx + 1}</p>
            </div>
            {booking.service ? (
              <div className="text-xs text-slate-600 mt-1 space-y-1 ml-6">
                <p className="font-medium truncate">{booking.service.name}</p>
                {booking.supplements.length > 0 && (
                  <p className="text-slate-500">+{booking.supplements.length} supplément(s)</p>
                )}
                {booking.hairdresser && (
                  <p className="text-slate-500 truncate">Coiffeur sélectionné</p>
                )}
                {booking.date && booking.time && (
                  <p className="text-slate-900 font-medium">
                    {booking.date.toLocaleDateString('fr-FR')} à {booking.time}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-1 ml-6">Non complétée</p>
            )}
          </div>
          {booking.service && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDeleteBooking(idx)
              }}
              className="text-red-500 hover:text-red-700 flex-shrink-0 p-1 transition-transform hover:scale-110"
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
