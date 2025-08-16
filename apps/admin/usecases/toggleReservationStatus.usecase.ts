import { editDocument } from "@zyra/conf/lib/query"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useToggleReservationStatus() {
  const queryClient = useQueryClient()

  const toggleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) =>
      editDocument("reservations", id, { status }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['reservations'] })
      },
  })

  return {
    toggleReservationStatus: toggleMutation.mutate,
    togglePending: toggleMutation.isPending,
  }
}