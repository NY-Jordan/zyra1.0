import { FeatureTypeEnum } from '../enums/FeatureTypeEnum'

export interface FeatureData {
  id?: string
  key: string // Clé unique pour l'internationalisation (ex: "analytics", "booking_limit")
  type: FeatureTypeEnum
  defaultValue: boolean | number | string
  createdAt?: any
  updatedAt?: any
}

// Interface pour l'affichage avec les textes traduits
export interface FeatureDisplayData extends FeatureData {
  name: string // Nom traduit
  description: string // Description traduite
}
