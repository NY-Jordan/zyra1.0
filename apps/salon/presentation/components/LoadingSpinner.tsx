import { cn } from "@zyra/ui/lib/utils"

interface LoadingSpinnerProps {
  className?: string
}

export function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div className={cn("animate-spin rounded-full border-2 border-gray-300 dark:border-slate-600 border-t-blue-600 dark:border-t-blue-400", className)} />
  )
}
