import React from 'react'
import { Plus, Trash2, User, Check, Clock, Calendar } from 'lucide-react'
import { Booking } from '../../../../app/booking/[id]/types'

interface ConfirmationStepProps {
  currentPersonIndex: number
  multipleBookings: Booking[]
  onAddPerson: () => void
  onFinalize: () => void
  onSelectBooking?: (index: number) => void
  onDeleteBooking?: (index: number) => void
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  currentPersonIndex,
  multipleBookings,
  onAddPerson,
  onFinalize,
  onSelectBooking,
  onDeleteBooking,
}) => {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-[18px] font-extrabold text-gray-900">Résumé des réservations</h2>
        <p className="text-[13px] text-gray-500">{multipleBookings.length} réservation{multipleBookings.length > 1 ? 's' : ''} au total</p>
      </div>

      <div className="space-y-2">
        {multipleBookings.map((booking, idx) => (
          <div
            key={idx}
            onClick={() => onSelectBooking?.(idx)}
            className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              idx === currentPersonIndex
                ? 'border-gray-900 bg-gray-100'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  booking.service ? 'bg-gray-100' : 'bg-gray-200'
                }`}>
                  {booking.service
                    ? <Check className="h-4 w-4 text-gray-900" />
                    : <User className="h-4 w-4 text-gray-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-bold text-gray-900">
                      Personne {booking.personNumber || idx + 1}
                    </p>
                    {booking.service && (
                      <span className="text-[10px] font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full">
                        Complète
                      </span>
                    )}
                  </div>
                  {booking.service && (
                    <div className="flex items-center gap-3 mt-1 text-[12px] text-gray-500">
                      <span className="font-medium text-gray-700">{booking.service.name}</span>
                      {booking.date && (
                        <>
                          <span className="text-gray-300">·</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{booking.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                          </div>
                        </>
                      )}
                      {booking.time && (
                        <>
                          <span className="text-gray-300">·</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{booking.time}</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  {!booking.service && (
                    <p className="text-[12px] text-gray-400 mt-0.5">Service non sélectionné</p>
                  )}
                </div>
              </div>

              {multipleBookings.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteBooking?.(idx) }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-rose-400 hover:bg-rose-50 transition-colors flex-shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 pt-2">
        <button
          onClick={onAddPerson}
          className="w-full h-11 rounded-2xl border-2 border-dashed border-gray-300 text-[13px] font-semibold text-gray-500 hover:border-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter une personne
        </button>

        <button
          onClick={onFinalize}
          className="w-full h-11 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white text-[13px] font-bold transition-colors shadow-sm shadow-gray-900/10"
        >
          Finaliser les réservations
        </button>
      </div>
    </div>
  )
}
