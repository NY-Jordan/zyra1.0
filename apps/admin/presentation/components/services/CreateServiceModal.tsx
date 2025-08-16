'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@zyra/ui/components/dialog"
import { Input } from "@zyra/ui/components/input"
import { Button } from "@zyra/ui/components/button"
import { useForm, Controller } from "react-hook-form"
import { useState } from "react"

const statusOptions = [
  { label: "Valide", value: true },
  { label: "Défendu", value: false },
]

interface CreateServiceModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { name: string, status: boolean }) => void
  loading?: boolean
}

export default function CreateServiceModal({ open, onClose, onSubmit, loading }: CreateServiceModalProps) {
  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: "",
      status: true,
    }
  })

  const handleFormSubmit = (data: any) => {
    onSubmit({ ...data, status : data.status === 'true', reservations: 0 })
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un service</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Nom du service *</label>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Nom requis" }}
              render={({ field }) => (
                <Input {...field} placeholder="Ex: Coupe homme" />
              )}
            />
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
          </div>
          <div>
            <label className="block font-medium mb-1">Statut *</label>
            <Controller
              name="status"
              control={control}
              rules={{
                required: "Statut requis",
              }}
              render={({ field }) => (
                <select
                  {...field}
                  className="border rounded px-2 py-2 w-full"
                  value={field.value.toString()}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => field.onChange(e.target.value)}
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value.toString()} value={opt.value.toString()}>{opt.label}</option>
                  ))}
                </select>
              )}
            />
            {errors.status && <span className="text-red-500 text-xs">{errors.status.message}</span>}
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose} disabled={loading}>Annuler</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}