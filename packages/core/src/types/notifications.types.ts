import { Timestamp } from 'firebase/firestore'

export type ActivityType =
  // Reservations
  | 'reservation_created'
  | 'reservation_confirmed'
  | 'reservation_canceled'
  | 'reservation_completed'
  | 'reservation_hairdresser_changed'
  | 'reservation_paid'
  | 'reservation_checked_in'
  | 'reservation_no_show'
  | 'reservation_rescheduled'
  | 'reservation_person_status_changed'
  // Orders
  | 'order_created'
  | 'order_completed'
  | 'order_canceled'
  | 'order_paid'
  | 'order_deleted'
  // Clients
  | 'client_created'
  | 'client_updated'
  | 'client_deleted'
  // Hairdressers
  | 'hairdresser_updated'
  | 'hairdresser_status_changed'
  | 'hairdresser_removed'
  | 'hairdresser_invitation_created'
  // Services
  | 'service_created'
  | 'service_updated'
  | 'service_deleted'
  | 'service_toggled'
  // Categories
  | 'category_created'
  | 'category_updated'
  | 'category_deleted'
  | 'category_toggled'
  // Salon
  | 'salon_updated'
  | 'salon_info_updated'
  | 'salon_location_updated'
  | 'salon_hours_updated'
  | 'salon_gallery_updated'

export type ResourceType =
  | 'reservation'
  | 'order'
  | 'client'
  | 'hairdresser'
  | 'service'
  | 'category'
  | 'salon'
  | 'invitation'

export interface LogContext {
  salonId: string
  actorId: string
  actorName: string
  resourceLabel?: string
}

export interface IActivity {
  id: string
  salonId: string
  type: ActivityType
  actorId: string
  actorName: string
  action: string
  resourceId: string
  resourceType: ResourceType
  resourceLabel: string
  metadata?: Record<string, unknown>
  createdAt: Timestamp
}

export interface INotification {
  id: string
  salonId: string
  type: ActivityType
  title: string
  body: string
  resourceId: string
  resourceType: ResourceType
  read: boolean
  createdAt: Timestamp
}
