import { where } from 'firebase/firestore';

import type { ISalon } from '@zyra/conf/domain/entities/salons.entities';

import { fetchCollection, getDocument } from '@/lib/query';

export const salonService = {
  async getSalonsByOwner(ownerId: string): Promise<ISalon[]> {
    return (await fetchCollection('salons', [where('ownerId', '==', ownerId)])) as ISalon[];
  },

  async getById(salonId: string): Promise<ISalon | null> {
    return (await getDocument('salons', salonId)) as ISalon | null;
  },
};
