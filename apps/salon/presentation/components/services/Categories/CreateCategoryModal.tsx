'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { Label } from '@zyra/ui/components/label'
import { Textarea } from '@zyra/ui/components/textarea'
import { RadioGroup, RadioGroupItem } from '@zyra/ui/components/radio-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@zyra/ui/components/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@zyra/ui/components/form'
import { toast } from 'sonner'
import { useServiceCategories } from '@/usecases/useServiceCategories'
import { Palette, Loader2 } from 'lucide-react'
import { IServiceCategory } from '@zyra/conf/domain/entities/salons.entities'

// Schema de validation avec Zod
const categorySchema = z.object({
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

type CategoryFormData = z.infer<typeof categorySchema>

interface CreateCategoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingCategories?: IServiceCategory[]
}

export default function CreateCategoryModal({ 
  open, 
  onOpenChange, 
  existingCategories = [] 
}: CreateCategoryModalProps) {
  const { createCategory, isCreating, createError } = useServiceCategories()
  
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
    },
  })

  const onSubmit = async (data: CategoryFormData) => {
    try {
      // Vérification si une catégorie avec le même nom existe déjà
      const categoryExists = existingCategories.some(
        category => category.name.toLowerCase().trim() === data.name.toLowerCase().trim()
      )
      if (categoryExists) {
        toast.error(
          `Une catégorie avec le nom "${data.name}" existe déjà.`,
          {
            description: 'Veuillez choisir un nom différent pour votre catégorie.',
            duration: 4000,
          }
        )
        // Mettre le focus sur le champ nom
        form.setFocus('name')
        form.setError('name', {
          type: 'manual',
          message: 'Ce nom de catégorie existe déjà'
        })
        return
      }

      await createCategory({
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        isActive: data.isActive,
      })
      toast.success('Catégorie créée avec succès!')
      // Reset form
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      toast.error('Erreur lors de la création de la catégorie')
    }
  }

  const handleClose = () => {
    form.reset()
    form.clearErrors()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Nouvelle Catégorie
          </DialogTitle>
          <DialogDescription>
            Créez une nouvelle catégorie de services pour organiser votre offre.
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
                      className="flex items-center gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="active" />
                        <Label htmlFor="active" className="text-sm font-normal cursor-pointer">
                          Actif
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="inactive" />
                        <Label htmlFor="inactive" className="text-sm font-normal cursor-pointer">
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

            {createError && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                Erreur: {createError.message || 'Une erreur est survenue'}
              </div>
            )}

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isCreating}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isCreating || !form.formState.isValid}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  'Créer la catégorie'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}