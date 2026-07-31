import { where } from 'firebase/firestore';

import {
  hairDresserAssociationNameEnum,
  type HairDresserSalonAssociation,
  type IHairDresser,
} from '@zyra/conf/domain/entities/hairdressers.entities';

import { fetchAllSubCollections, fetchCollection, getDocument } from '@/lib/query';

export type HairDresserWithSalonAssociation = IHairDresser & {
  associationHairdresser: HairDresserSalonAssociation;
};

export const hairdresserService = {
  async getById(hairDresserId: string): Promise<IHairDresser | null> {
    return (await getDocument('hair_dressers', hairDresserId)) as IHairDresser | null;
  },

  /** Mirrors packages/core/src/usecases/useHairDressers.ts's queryFn. */
  async getBySalon(salonId: string): Promise<HairDresserWithSalonAssociation[]> {
    const associations = (await fetchAllSubCollections(hairDresserAssociationNameEnum.SALON_HAIR_DRESSER, [
      where('salonId', '==', salonId),
    ])) as HairDresserSalonAssociation[];

    const withHairDressers = await Promise.all(
      associations.map(async (association) => {
        const matches = (await fetchCollection('hair_dressers', [
          where('id', '==', association.parentId),
        ])) as IHairDresser[];
        return matches[0] ? { ...matches[0], associationHairdresser: association } : null;
      })
    );

    return withHairDressers.filter((h): h is HairDresserWithSalonAssociation => h !== null);
  },
};
