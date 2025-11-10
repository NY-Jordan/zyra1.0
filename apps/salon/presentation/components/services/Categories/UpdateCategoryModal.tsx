'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { Label } from '@zyra/ui/components/label'
import { Textarea } from '@zyra/ui/components/textarea'
import { RadioGroup, RadioGroupItem } from '@zyra/ui/components/radio-group'
import {Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle} from '@zyra/ui/components/dialog'
import {Form,FormControl,FormDescription,FormField,FormItem,FormLabel,FormMessage} from '@zyra/ui/components/form'
import { toast } from 'sonner'
import { useServiceCategories } from '@/usecases/useServiceCategories'
import { Edit, Loader2 } from 'lucide-react'
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Modifier la Catégorie
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations de la catégorie "{category.name}".
          </DialogDescription>
        </DialogHeader>

        <Form {...(form as any)}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control as any}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
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
                  <FormLabel>Description (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description de la catégorie..."
                      rows={3}
                      {...field}
                      disabled={isUpdating}
                    />
                  </FormControl>
                  <FormDescription>
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
                  <FormLabel>Statut</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => field.onChange(value === 'true')}
                      value={field.value ? 'true' : 'false'}
                      disabled={isUpdating}
                      className="flex items-center gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="active-update" />
                        <Label htmlFor="active-update" className="text-sm font-normal cursor-pointer">
                          Actif
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="inactive-update" />
                        <Label htmlFor="inactive-update" className="text-sm font-normal cursor-pointer">
                          Inactif
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    Les catégories inactives ne seront pas visibles pour la réservation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {updateError && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                Erreur: {updateError.message || 'Une erreur est survenue'}
              </div>
            )}

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isUpdating}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isUpdating || !form.formState.isValid}>
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  'Mettre à jour'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}