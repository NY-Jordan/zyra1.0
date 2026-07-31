import { where } from 'firebase/firestore';

import type { IClient } from '@zyra/conf/domain/entities/clients.entities';

import { fetchCollection } from '@/lib/query';

export const clientService = {
  async getClientsBySalon(salonId: string): Promise<IClient[]> {
    return (await fetchCollection('clients', [where('salonId', '==', salonId)])) as IClient[];
  },
};
