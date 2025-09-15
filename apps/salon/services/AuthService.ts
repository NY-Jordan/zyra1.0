'use server'
import { IOwner } from '@zyra/conf/domain/entities/owners.entities'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'
import { StatusCodeEnum } from '@zyra/conf/domain/enums/StatusCodeEnum'
import { SalonStatusEnum } from '@zyra/conf/domain/enums/statusEnum'
import { redirect } from 'next/navigation'
import Cookies from "js-cookie";

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


export  async function authSalonProcess(owner: IOwner,
    salons: ISalon[]) {
    if (salons.length === 1) {
      Cookies.set('salonId', salons[0].id, { expires: 1 });
      if (salons[0].status.name === SalonStatusEnum.payment) {
        return redirect('/salon/payment/packages');
      }
      redirect('/salon/dashboard');
      return;
    }
    return;
}