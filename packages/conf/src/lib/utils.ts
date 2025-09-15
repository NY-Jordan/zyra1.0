import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const formatCountdown = (ms: number) => {
    const min = Math.floor(ms / 60000)
    const sec = Math.floor((ms % 60000) / 1000)
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  }

export function isFileArray(value: any): value is File[] {
  return Array.isArray(value) && value.every(item => item instanceof File);
}

export function generatePassword(length = 12) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let pwd = ""
  for (let i = 0; i < length; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)]
  }
  return pwd
}

export async function uploadLogoFile(folders : string, file : File): Promise<string> {
  const storage = getStorage();
  const storageRef = ref(storage, `${folders}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}


export const statusReservationDescriptions: Record<string, string> = {
  pending: "En attente : La réservation n'a pas encore été confirmée.",
  confirmed: "Confirmée : La réservation est validée.",
  cancelled: "Annulée : La réservation a été annulée.",
  completed: "Terminée : La réservation est terminée.",
}

export const statusOrderReservation = ["pending", "confirmed", "completed", "cancelled"]


export function canTransitionStatusReservation(current: string, target: string) {
  const idxCurrent = statusOrderReservation.indexOf(current)
  const idxTarget = statusOrderReservation.indexOf(target)
  // Autorisé si c'est le statut suivant ou "cancelled"
  return (
    (idxTarget === idxCurrent + 1) ||
    (target === "cancelled" && current !== "cancelled")
  )
}

export const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + ' ' + currency
  }