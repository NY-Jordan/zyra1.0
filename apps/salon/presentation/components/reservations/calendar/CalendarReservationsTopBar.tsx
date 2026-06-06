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
    <div className="shrink-0 border-b border-slate-200/70 bg-white/75 px-5 py-3 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/70">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-700 dark:border-sky-700/60 dark:bg-sky-950/40 dark:text-sky-200">
            Planning
          </span>
          <span className="text-base font-semibold capitalize text-slate-800 dark:text-slate-100">{dayLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToday}
            className="h-8 border-slate-200 bg-white/70 px-3 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Aujourd'hui
          </Button>

          <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white/80 dark:border-slate-700 dark:bg-slate-900/70">
            <button
              onClick={onPrev}
              className="border-r border-slate-200 px-2.5 py-1.5 transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            </button>
            <button
              onClick={onNext}
              className="px-2.5 py-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="ml-1 rounded-lg p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4 text-slate-500 dark:text-slate-300" />
          </button>
        </div>
      </div>
    </div>
  )
}
