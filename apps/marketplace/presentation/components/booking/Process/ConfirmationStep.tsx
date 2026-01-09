import React from 'react'
import { Button } from '@zyra/ui/components/button'
import { Card, CardContent } from '@zyra/ui/components/card'
import { ArrowRight, Plus, Trash2, User } from 'lucide-react'
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
    <div className="space-y-6">
      {/* Titre et description */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Résumé de vos réservations</h2>
        <p className="text-gray-600 mt-1">Vous avez {multipleBookings.length} réservation(s)</p>
      </div>

      {/* Résumé des réservations */}
      <div className="space-y-3">
        {multipleBookings.map((booking, idx) => (
          <Card
            key={idx}
            className={`cursor-pointer transition-all ${
              idx === currentPersonIndex
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
            onClick={() => onSelectBooking?.(idx)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <h3 className="font-semibold text-lg">
                      Personne {booking.personNumber || idx + 1}
                    </h3>
                    {booking.service && (
                      <span className="ml-auto text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                        ✓ Complète
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                    <div>
                      <p className="text-gray-500 text-xs">Service</p>
                      <p className="font-medium text-gray-900">
                        {booking.service?.name || 'Non sélectionné'}
                      </p>
                    </div>
                    
                    {booking.hairdresser && (
                      <div>
                        <p className="text-gray-500 text-xs">Coiffeur</p>
                        <p className="font-medium text-gray-900">
                          {'N\'importe qui'}
                        </p>
                      </div>
                    )}
                    
                    {booking.date && (
                      <div>
                        <p className="text-gray-500 text-xs">Date</p>
                        <p className="font-medium text-gray-900">
                          {booking.date.toLocaleDateString('fr-FR', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    )}
                    
                    {booking.time && (
                      <div>
                        <p className="text-gray-500 text-xs">Heure</p>
                        <p className="font-medium text-gray-900">{booking.time}</p>
                      </div>
                    )}
                    
                    {booking.supplements && booking.supplements.length > 0 && (
                      <div className="col-span-2">
                        <p className="text-gray-500 text-xs">Suppléments</p>
                        <p className="font-medium text-gray-900">
                          {booking.supplements.length} ajout(s)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bouton supprimer */}
                {multipleBookings.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteBooking?.(idx)
                    }}
                    className="ml-4 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Supprimer cette réservation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Boutons d'action */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
        <Button
          onClick={onAddPerson}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une personne
        </Button>
        
        <Button
          onClick={onFinalize}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          Finaliser les réservations
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
