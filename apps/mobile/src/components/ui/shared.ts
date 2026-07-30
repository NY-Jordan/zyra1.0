export const CARD_CLASS =
  'bg-white dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl';

export type StatusTone = 'amber' | 'sky' | 'emerald' | 'rose' | 'slate' | 'violet';

export const STATUS_TONE_CLASSES: Record<StatusTone, { bg: string; text: string; dot: string }> = {
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  sky: {
    bg: 'bg-sky-50 dark:bg-sky-950/20',
    text: 'text-sky-700 dark:text-sky-400',
    dot: 'bg-sky-500',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/20',
    text: 'text-rose-700 dark:text-rose-400',
    dot: 'bg-rose-500',
  },
  slate: {
    bg: 'bg-slate-100 dark:bg-slate-800/40',
    text: 'text-slate-600 dark:text-slate-400',
    dot: 'bg-slate-400',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-950/20',
    text: 'text-violet-700 dark:text-violet-400',
    dot: 'bg-violet-500',
  },
};
