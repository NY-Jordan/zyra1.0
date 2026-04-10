import { Button } from '@zyra/ui/components/button'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

type Props = {
  dayLabel: string
  onToday: () => void
  onPrev: () => void
  onNext: () => void
  onClose: () => void
}

export function CalendarReservationsTopBar({
  dayLabel,
  onToday,
  onPrev,
  onNext,
  onClose,
}: Props) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b bg-white shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-base font-semibold text-gray-800 capitalize">{dayLabel}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onToday} className="text-xs h-8 px-3">
          Aujourd'hui
        </Button>
        <div className="flex items-center border rounded-md overflow-hidden">
          <button onClick={onPrev} className="px-2 py-1.5 hover:bg-gray-50 transition border-r">
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <button onClick={onNext} className="px-2 py-1.5 hover:bg-gray-50 transition">
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        <button onClick={onClose} className="ml-2 p-1.5 hover:bg-gray-100 rounded-md transition">
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>
    </div>
  )
}
