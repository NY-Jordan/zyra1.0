import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { CardDetails } from "@/domain/entities/payment.entities";

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



  export const detectOperator = (phoneNumber: string): 'mtn' | 'orange' | null => {
  // Nettoyer le numéro (enlever espaces, tirets, etc.)
  const cleanNumber = phoneNumber.replace(/\s|-/g, '')
  
  // Extraire la partie numérique (sans +237)
  let numberPart = cleanNumber
  if (cleanNumber.startsWith('+237')) {
    numberPart = cleanNumber.substring(4)
  } else if (cleanNumber.startsWith('237')) {
    numberPart = cleanNumber.substring(3)
  }
  
  // Si le numéro n'a pas de préfixe, on assume qu'il est déjà au format local
  if (!numberPart.startsWith('6')) {
    return null
  }
  
  // Préfixes MTN Cameroun basés sur votre code PHP
  const mtnPrefixes = [
    '67', // 67% (67X)
    '650', '651', '652', '653', '654', // 650-654
    '680', '681', '682', '683' // 680-683
  ]
  
  // Préfixes Orange Cameroun basés sur votre code PHP  
  const orangePrefixes = [
    '69', // 69% (69X)
    '655', '656', '657', '658', '659' // 655-659
  ]
  
  // Vérifier les préfixes MTN (en commençant par les plus spécifiques)
  for (const prefix of mtnPrefixes) {
    if (numberPart.startsWith(prefix)) {
      return 'mtn'
    }
  }
  
  // Vérifier les préfixes Orange (en commençant par les plus spécifiques)
  for (const prefix of orangePrefixes) {
    if (numberPart.startsWith(prefix)) {
      return 'orange'
    }
  }
  
  return null
}



// Fonction utilitaire pour valider le numéro
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  // Nettoyer le numéro
  const cleanNumber = phoneNumber.replace(/\s|-/g, '')
  
  // Extraire la partie numérique
  let numberPart = cleanNumber
  if (cleanNumber.startsWith('+237')) {
    numberPart = cleanNumber.substring(4)
  } else if (cleanNumber.startsWith('237')) {
    numberPart = cleanNumber.substring(3)
  }
  
  // Vérifier le format de base (9 chiffres commençant par 6)
  if (!/^6\d{8}$/.test(numberPart)) {
    return false
  }
  
  // Vérifier si l'opérateur est reconnu
  return detectOperator(phoneNumber) !== null
}


 export const isCardValid = (cardDetails: CardDetails) => {
    const { cardNumber, expiryDate, cvv, cardholderName } = cardDetails
    const cleanCardNumber = cardNumber.replace(/\s/g, '')
    return (
      cardholderName.trim().length >= 2 &&
      cleanCardNumber.length >= 13 &&
      /^\d{2}\/\d{2}$/.test(expiryDate) &&
      cvv.length >= 3
    )
  }


  export const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Date inconnue'
    const date = new Date(timestamp.seconds * 1000)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  export const formatDateTime = (timestamp: any) => {
    if (!timestamp) return 'Date inconnue'
    const date = new Date(timestamp.seconds * 1000)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }