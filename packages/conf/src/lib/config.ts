import { IService } from "../domain/entities/services.entities"
import { OpeningHour } from "../domain/entities/salons.entities"
import { GeneralConfigForm, SalonConfigForm } from "../domain/entities/settings.entities"
import { ConfigTypeEnum } from "../domain/enums/ConfigTypeEnum"


export const flutterWaveConfig = {
  secretKey: 'FLWSECK_TEST-15c94cb3db3cd6a46edf101d0530aad0-X',
  publicKey: 'FLWPUBK_TEST-c0f86cebd9fc7f3bd954c143a36f233e-X',
  encryptionKey:  'FLWSECK_TEST5f46553a15f7'
}


export const URL_LOGIN_BACK = "http://localhost:3000/auth/finish-signin"

export const LS_MAX_ATTEMPTS = 3
export const LS_BLOCK_DURATION = 1 * 60 * 1000 // 5 minutes en ms
export const LS_BLOCKED_UNTIL_KEY = "login_blocked_until"
export const LS_ATTEMPTS_KEY = "login_attempts"
export type TIME_UNIT = 'min' | 'h'

export  const GENERAL_CONFIG_DEFAULTS: GeneralConfigForm = {
  commission: 10,
  currency: 'XAF',
  timezone: 'Africa/Douala',
  minBookingDuration: 30,
  minAdvanceBookingTime: 2,
  minBookingDurationUnit: 'min',
  minAdvanceBookingTimeUnit: 'h',
  type : ConfigTypeEnum.general
}

export const SALON_CONFIG_DEFAULTS: SalonConfigForm = {
  maxSalons: 10,
  defaultSalonStatus: 'actif',
  type : ConfigTypeEnum.salon
}


export const defaultOpeningHours: OpeningHour[] = [
  { day: "Lundi", open: "09:00", close: "21:00", openDay : true },
  { day: "Mardi", open: "09:00", close: "21:00", openDay : true },
  { day: "Mercredi", open: "09:00", close: "21:00", openDay : true },
  { day: "Jeudi", open: "09:00", close: "21:00", openDay : true },
  { day: "Vendredi", open: "09:00", close: "21:00", openDay : true },
  { day: "Samedi", open: "09:00", close: "21:00", openDay : true },
  { day: "Dimanche", open: "09:00", close: "21:00", openDay : true },
]


export const initServiceParams = (name: string) => {
  return {
    name: name.trim(),
    reservations: 0,
    status : true
  }
}


export function levenshtein(a : string, b : string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) dp[i]![0] = i;
  for (let j = 0; j <= b.length; j++) dp[0]![j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i]![j] = a[i - 1] === b[j - 1]
        ? dp[i - 1]![j - 1]
        : 1 + Math.min(dp[i - 1]![j], dp[i]![j - 1], dp[i - 1]![j - 1]);
    }
  }

  return dp[a.length]![b.length];
}


export function isForbiddenService(serviceName: string, services : IService[]): boolean {
    const threshold = 2; // 0 = same, 1 ou 2 = very close (tolerance)
    const cleaned = serviceName.trim().toLowerCase();
    return services.some(forbidden => {
      const distance = levenshtein(cleaned, forbidden.name?.toLowerCase() || "");
      return distance <= threshold;
    });
}


export function generateUniqueId() {
  return Math.random().toString(36).substr(2, 16) + Date.now().toString(36)
}
