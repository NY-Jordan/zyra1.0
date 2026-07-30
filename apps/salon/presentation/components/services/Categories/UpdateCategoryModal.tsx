'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@zyra/ui/components/input'
import { Label } from '@zyra/ui/components/label'
import { Textarea } from '@zyra/ui/components/textarea'
import { RadioGroup, RadioGroupItem } from '@zyra/ui/components/radio-group'
import { Dialog, DialogContent, DialogTitle } from '@zyra/ui/components/dialog'
import {Form,FormControl,FormDescription,FormField,FormItem,FormLabel,FormMessage} from '@zyra/ui/components/form'
import { toast } from 'sonner'
import { useServiceCategories } from '@zyra/core/usecases/useServiceCategories'
import { Edit, Loader2, X } from 'lucide-react'
import { IServiceCategory } from '@zyra/conf/domain/entities/salons.entities'

// Schema de validation avec Zod (identique au modal de création)
const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom est obligatoire')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  description: z
    .string()
    .max(200, 'La description ne peut pas dépasser 200 caractères')
    .optional(),
  isActive: z.boolean().default(true),
})

type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>

interface UpdateCategoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: IServiceCategory | null
  existingCategories?: IServiceCategory[]
}

export default function UpdateCategoryModal({ 
  open, 
  onOpenChange, 
  category,
  existingCategories = [] 
}: UpdateCategoryModalProps) {
  const { updateCategory, isUpdating, updateError } = useServiceCategories()
  const form = useForm<UpdateCategoryFormData>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
    },
  })

  // Pré-remplir le formulaire quand la catégorie change
  useEffect(() => {
    if (category && open) {
      form.reset({
        name: category.name || '',
        description: category.description || '',
        isActive: category.isActive !== false,
      })
    }
  }, [category, open, form])

  const onSubmit = async (data: UpdateCategoryFormData) => {
    if (!category) {
      toast.error('Aucune catégorie sélectionnée')
      return
    }
    try {
      // Vérification si une autre catégorie avec le même nom existe déjà (exclure la catégorie courante)
      const categoryExists = existingCategories.some(
        existingCategory => 
          existingCategory.id !== category.id && 
          existingCategory.name.toLowerCase().trim() === data.name.toLowerCase().trim()
      )
      if (categoryExists) {
        toast.error(
          `Une autre catégorie avec le nom "${data.name}" existe déjà.`,
          {
            description: 'Veuillez choisir un nom différent pour votre catégorie.',
            duration: 4000,
          }
        )
        form.setFocus('name')
        form.setError('name', {
          type: 'manual',
          message: 'Ce nom de catégorie existe déjà'
        })
        return
      }

      // Vérifier s'il y a des changements
      const hasChanges = 
        data.name.trim() !== category.name ||
        (data.description?.trim() || '') !== (category.description || '') ||
        data.isActive !== (category.isActive !== false)

      if (!hasChanges) {
        toast.info('Aucune modification détectée')
        handleClose()
        return
      }

      await updateCategory(category.id, {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        isActive: data.isActive,
      })

      toast.success('Catégorie mise à jour avec succès!')
      handleClose()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      toast.error('Erreur lors de la mise à jour de la catégorie')
    }
  }

  const handleClose = () => {
    form.reset()
    form.clearErrors()
    onOpenChange(false)
  }

  // Ne pas afficher le modal si aucune catégorie n'est sélectionnée
  if (!category) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md p-0 overflow-hidden bg-white dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl gap-0 max-h-[88vh]"
      >
        <DialogTitle className="sr-only">Modifier la Catégorie</DialogTitle>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#F0EAE4] dark:border-slate-800/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                <Edit className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-[16px] font-extrabold text-slate-800 dark:text-white leading-tight">
                  Modifier la Catégorie
                </h2>
                <p className="text-[12px] text-slate-400 mt-0.5">
                  Modifiez les informations de la catégorie "{category.name}".
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-7 h-7 rounded-full bg-[#F5F2EF] dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <Form {...(form as any)}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="px-6 py-5 space-y-4 overflow-y-auto">
            <FormField
              control={form.control as any}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px] font-bold text-slate-600 dark:text-slate-300">
                    Nom de la catégorie <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Coiffure Femme, Coloration..."
                      {...field}
                      disabled={isUpdating}
                      onChange={(e) => {
                        field.onChange(e)
                        // Clear error when user starts typing
                        if (form.formState.errors.name) {
                          form.clearErrors('name')
                        }
                      }}
                      className="h-10 rounded-xl border-[#E8E0D8] dark:border-slate-700"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px] font-bold text-slate-600 dark:text-slate-300">Description (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description de la catégorie..."
                      rows={3}
                      {...field}
                      disabled={isUpdating}
                      className="rounded-xl border-[#E8E0D8] dark:border-slate-700"
                    />
                  </FormControl>
                  <FormDescription className="text-[11px]">
                    Une description courte pour expliquer cette catégorie
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="isActive"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[12px] font-bold text-slate-600 dark:text-slate-300">Statut</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => field.onChange(value === 'true')}
                      value={field.value ? 'true' : 'false'}
                      disabled={isUpdating}
                      className="flex items-center gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="active-update" />
                        <Label htmlFor="active-update" className="text-[13px] font-medium cursor-pointer">
                          Actif
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="inactive-update" />
                        <Label htmlFor="inactive-update" className="text-[13px] font-medium cursor-pointer">
                          Inactif
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription className="text-[11px]">
                    Les catégories inactives ne seront pas visibles pour la réservation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {updateError && (
              <div className="p-3 text-[12px] text-destructive bg-destructive/10 rounded-xl">
                Erreur: {updateError.message || 'Une erreur est survenue'}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-6 py-4 border-t border-[#F0EAE4] dark:border-slate-800/50 bg-[#FAF7F4] dark:bg-slate-800/30">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUpdating}
              className="h-9 px-5 rounded-xl text-[12px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-[#E8E0D8] dark:border-slate-700 hover:bg-[#F5F2EF] dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isUpdating || !form.formState.isValid}
              className="flex items-center gap-1.5 h-9 px-5 rounded-xl text-[12px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                'Mettre à jour'
              )}
            </button>
          </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}