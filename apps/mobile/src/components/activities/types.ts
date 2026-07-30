export type ActivityResourceType = 'reservation' | 'order' | 'client' | 'hairdresser' | 'service';

export type ActivityEntry = {
  id: string;
  resourceType: ActivityResourceType;
  actorName: string;
  action: string;
  resourceLabel: string;
  time: string;
  dateGroup: string;
};

export const RESOURCE_LABELS: Record<ActivityResourceType, string> = {
  reservation: 'Réservations',
  order: 'Commandes',
  client: 'Clients',
  hairdresser: 'Coiffeurs',
  service: 'Services',
};

export const RESOURCE_TONES: Record<ActivityResourceType, 'sky' | 'emerald' | 'violet' | 'amber' | 'rose'> = {
  reservation: 'sky',
  order: 'emerald',
  client: 'violet',
  hairdresser: 'amber',
  service: 'rose',
};

export const MOCK_ACTIVITIES: ActivityEntry[] = [
  {
    id: '1',
    resourceType: 'reservation',
    actorName: 'Awa',
    action: 'a créé',
    resourceLabel: 'Réservation #12489',
    time: 'il y a 5 min',
    dateGroup: "Aujourd'hui",
  },
  {
    id: '2',
    resourceType: 'order',
    actorName: 'Junior Foka',
    action: 'a marqué payée',
    resourceLabel: 'Commande #3021',
    time: 'il y a 1h',
    dateGroup: "Aujourd'hui",
  },
  {
    id: '3',
    resourceType: 'client',
    actorName: 'Awa',
    action: 'a ajouté',
    resourceLabel: 'Grace Eyenga',
    time: 'il y a 3h',
    dateGroup: "Aujourd'hui",
  },
  {
    id: '4',
    resourceType: 'hairdresser',
    actorName: 'Awa',
    action: 'a invité',
    resourceLabel: 'Grace Mballa',
    time: 'hier, 16:40',
    dateGroup: 'Hier',
  },
  {
    id: '5',
    resourceType: 'service',
    actorName: 'Awa',
    action: 'a modifié',
    resourceLabel: 'Coupe + Brushing',
    time: 'hier, 11:05',
    dateGroup: 'Hier',
  },
];
