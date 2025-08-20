import { StatusCodeEnum } from '@zyra/conf/domain/enums/StatusCodeEnum'

export const isBlocked = async (email: string) => {
  // Simple stub - always return not blocked for salon
  return { blocked: false, blockedUntil: null }
}

export const LoginByEmail = async (email: string) => {
  // Simple stub - always return OK for salon
  console.log('Salon login attempt:', email)
  return StatusCodeEnum.OK
}

export const recordAttempt = async (email: string) => {
  // Simple stub - no actual recording for salon
  console.log('Recording attempt for:', email)
}
