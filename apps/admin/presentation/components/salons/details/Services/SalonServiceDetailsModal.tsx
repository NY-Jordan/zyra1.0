'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@zyra/ui/components/dialog'
import { ISalonService } from '@zyra/conf/domain/entities/salons.entities'

export default function SalonServiceDetailsModal({
  open,
  onClose,
  service,
}: {
  open: boolean
  onClose: () => void
  service: ISalonService
}) {
  if (!service) return null

  // Calculate total price and duration including supplements
  const supplements = service.supplements || []
  const supplementsPrice = supplements.reduce((acc: number, sup: any) => acc + (Number(sup.price) || 0), 0)
  const supplementsDuration = supplements.reduce((acc: number, sup: any) => acc + (Number(sup.duration) || 0), 0)
  const totalPrice = (Number(service.price) || 0) + supplementsPrice
  const totalDuration = (Number(service.duration) || 0) + supplementsDuration

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Détail du service</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {service.imageUrl && (
              <img src={service.imageUrl} alt="" className="w-16 h-16 object-cover rounded" />
            )}
            <div>
              <div className="font-bold text-lg">
                <span className="font-medium text-gray-600">Nom : </span>
                {service.name}
              </div>
              <div className="text-blue-600 font-semibold">
                <span className="font-medium text-gray-600">Prix : </span>
                {service.price} FCFA
              </div>
              <div className="text-gray-700">
                <span className="font-medium text-gray-600">Durée : </span>
                {service.duration} min
              </div>
            </div>
          </div>
          {supplements.length > 0 && (
            <div>
              <div className="font-semibold mb-1">Suppléments :</div>
              <ul className="list-disc pl-5">
                {supplements.map((sup: any, idx: number) => (
                  <li key={idx}>
                    <span className="font-medium">{sup.name}</span>
                    {sup.price && <> - {sup.price} FCFA</>}
                    {sup.duration && <> - {sup.duration} min</>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-4 flex gap-6">
            <div className="text-xl font-bold text-green-700 bg-green-100 px-4 py-2 rounded">
              Prix total : {totalPrice} FCFA
            </div>
            <div className="text-xl font-bold text-indigo-700 bg-indigo-100 px-4 py-2 rounded">
              Durée totale : {totalDuration} min
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}