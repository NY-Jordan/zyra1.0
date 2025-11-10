import * as z from 'zod'


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
})
