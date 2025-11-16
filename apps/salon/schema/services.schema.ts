import * as z from 'zod'

// Schema pour un supplément individuel
export const supplementSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom du supplément est obligatoire')
    .min(2, 'Le nom du supplément doit contenir au moins 2 caractères')
    .max(50, 'Le nom du supplément ne peut pas dépasser 50 caractères'),
  price: z
    .number({
      required_error: 'Le prix du supplément est obligatoire',
      invalid_type_error: 'Le prix du supplément doit être un nombre',
    })
    .min(0, 'Le prix du supplément ne peut pas être négatif')
    .max(100000, 'Le prix du supplément ne peut pas dépasser 100,000'),
  duration: z
    .number({
      required_error: 'La durée du supplément est obligatoire',
      invalid_type_error: 'La durée du supplément doit être un nombre',
    })
    .min(0, 'La durée du supplément ne peut pas être négative')
    .max(240, 'La durée du supplément ne peut pas dépasser 4 heures (240 minutes)'),
})

// Schema pour la liste des suppléments
export const supplementsSchema = z.array(supplementSchema)

export const serviceSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom est obligatoire')
    .min(4, 'Le nom doit contenir au moins 4 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  price: z
    .number({
      required_error: 'Le prix est obligatoire',
      invalid_type_error: 'Le prix doit être un nombre',
    })
    .min(0, 'Le prix ne peut pas être négatif')
    .max(1000000, 'Le prix ne peut pas dépasser 1,000,000'),
  duration: z
    .number({
      required_error: 'La durée est obligatoire',
      invalid_type_error: 'La durée doit être un nombre',
    })
    .min(5, 'La durée minimum est de 5 minutes')
    .max(480, 'La durée maximum est de 8 heures (480 minutes)'),
  categoryId: z
    .string()
    .min(1, 'La catégorie est obligatoire'),
  isActive: z.boolean().default(true),
  imageUrl: z
    .string()
    .url('L\'URL de l\'image doit être valide')
    .optional()
    .or(z.literal('')),
  supplements: supplementsSchema.optional().default([]),
})

// Types TypeScript dérivés des schemas
export type Supplement = z.infer<typeof supplementSchema>
export type Service = z.infer<typeof serviceSchema>
