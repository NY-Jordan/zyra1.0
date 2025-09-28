// Features par défaut - stocke seulement les clés et métadonnées
// Les textes sont gérés dans featuresTranslations.ts

import { FeatureTypeEnum } from '@zyra/conf/domain/enums/FeatureTypeEnum'

const defaultFeatures = [
  {
    id: "analytics",
    key: "analytics",
    type: FeatureTypeEnum.ACCESS,
    defaultValue: false
  },
  {
    id: "booking_limit",
    key: "booking_limit",
    type: FeatureTypeEnum.LIMIT,
    defaultValue: 50
  },
  {
    id: "booking_limit",
    key: "booking_limit",
    type: FeatureTypeEnum.LIMIT,
    defaultValue: 'unlimited'
  },
  {
    id: "custom_branding",
    key: "custom_branding",
    type: FeatureTypeEnum.FEATURE,
    defaultValue: false
  },
  {
    id: "email_notifications",
    key: "email_notifications",
    type: FeatureTypeEnum.SETTING,
    defaultValue: true
  },
  {
    id: "staff_management",
    key: "staff_management",
    type: FeatureTypeEnum.ACCESS,
    defaultValue: false
  },
  {
    id: "max_services",
    key: "max_services",
    type: FeatureTypeEnum.LIMIT,
    defaultValue: 10
  },
  {
    id: "online_payment",
    key: "online_payment",
    type: FeatureTypeEnum.FEATURE,
    defaultValue: false
  },
  {
    id: "appointment_reminder",
    key: "appointment_reminder",
    type: FeatureTypeEnum.SETTING,
    defaultValue: true
  },
  {
    id: "multi_location",
    key: "multi_location",
    type: FeatureTypeEnum.ACCESS,
    defaultValue: false
  },
  {
    id: "storage_limit",
    key: "storage_limit",
    type: FeatureTypeEnum.LIMIT,
    defaultValue: 5
  }
]

export default defaultFeatures
