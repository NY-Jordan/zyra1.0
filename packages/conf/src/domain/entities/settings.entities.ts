import { TIME_UNIT } from "@zyra/conf/lib/config"
import { ConfigTypeEnum } from "../enums/ConfigTypeEnum.js"

export type GeneralConfigForm = {
  type : ConfigTypeEnum
  commission: number
  currency: string
  timezone: string
  minBookingDuration: number
  minAdvanceBookingTime: number,
  minBookingDurationUnit : TIME_UNIT,
  minAdvanceBookingTimeUnit : TIME_UNIT
}

export type SalonConfigForm = {
  maxSalons: number
  defaultSalonStatus: string
  type : ConfigTypeEnum
}
