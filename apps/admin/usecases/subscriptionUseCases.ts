import { useQuery } from '@tanstack/react-query'
import { fetchCollection, createDocument, editDocument } from '@zyra/conf/lib/query'
import { where, Timestamp } from 'firebase/firestore'
import { IPackage } from '@zyra/conf/domain/entities/package.entities'
import {
  ISubscription,
  BillingPeriod,
  SubscriptionStatus,
} from '@zyra/conf/domain/entities/subscriptions.entities'
import { UserTypeEnum } from '@zyra/conf/domain/enums/UserTypeEnum'
import { SalonStatusEnum } from '@zyra/conf/domain/enums/statusEnum'

export function useSalonPackages() {
  return useQuery({
    queryKey: ['salon-packages'],
    queryFn: async () => {
      const pkgs = await fetchCollection('packages', [
        where('type', '==', UserTypeEnum.SALON),
        where('active', '==', true),
      ])
      return pkgs as unknown as IPackage[]
    },
  })
}

export function useSalonSubscription(salonId?: string) {
  return useQuery({
    queryKey: ['salon-subscription', salonId],
    enabled: !!salonId,
    queryFn: async () => {
      const subs = await fetchCollection('subscriptions', [
        where('userId', '==', salonId),
        where('status', '==', SubscriptionStatus.ACTIVE),
      ])
      return (subs[0] as unknown as ISubscription) ?? null
    },
  })
}

export async function upsertSalonSubscription(params: {
  salonId: string
  salonName?: string
  pkg: IPackage
  endDate: Date
  currentSalonStatus?: string
}) {
  const { salonId, salonName, pkg, endDate, currentSalonStatus } = params
  const now = Timestamp.now()
  const end = Timestamp.fromDate(endDate)
  const diffDays = Math.round((endDate.getTime() - Date.now()) / 86_400_000)
  const billingPeriod = diffDays >= 360 ? BillingPeriod.YEARLY : BillingPeriod.MONTHLY

  // Check for any existing subscription (active or expired) for this salon
  const existing = await fetchCollection('subscriptions', [
    where('userId', '==', salonId),
  ])
  const existingSub = existing[0] as unknown as (ISubscription & { id: string }) | undefined

  if (existingSub?.id) {
    // Update the existing subscription
    await editDocument('subscriptions', existingSub.id, {
      packageId: pkg.id,
      packageName: pkg.name,
      packageFeatures: pkg.features ?? [],
      billingPeriod,
      amount: pkg.price,
      currency: pkg.currency,
      status: SubscriptionStatus.ACTIVE,
      startDate: now,
      endDate: end,
      renewalCount: (existingSub.renewalCount ?? 0) + 1,
      updatedAt: now,
    })
  } else {
    // No subscription yet — create one
    await createDocument('subscriptions', {
      userId: salonId,
      userName: salonName ?? '',
      packageId: pkg.id,
      packageName: pkg.name,
      packageFeatures: pkg.features ?? [],
      billingPeriod,
      amount: pkg.price,
      currency: pkg.currency,
      status: SubscriptionStatus.ACTIVE,
      startDate: now,
      endDate: end,
      autoRenew: false,
      renewalCount: 0,
    })
  }

  // Only update salon status when it needs to change (payment → active)
  if (currentSalonStatus === SalonStatusEnum.payment) {
    await editDocument('salons', salonId, {
      status: { name: SalonStatusEnum.active, createdAt: new Date() },
    })
  }
}
