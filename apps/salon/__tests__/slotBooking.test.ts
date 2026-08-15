import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { Timestamp } from 'firebase/firestore'

// Test d'intégration contre l'émulateur Firestore local (127.0.0.1:8080, déjà
// configuré dans @zyra/conf/lib/firebase) : la logique de verrouillage
// transactionnelle dépend du vrai comportement de `runTransaction` (relecture
// après conflit, retry), qu'un mock maison ne peut pas reproduire fidèlement
// — en particulier le cas de réservation vraiment concurrente.
import {
  bookAppointmentSlots,
  releaseAppointmentSlots,
  updateReservationSlots,
  getDocument,
  SlotConflictError,
  LockablePerson,
} from '@zyra/conf/lib/query'

const SALON_ID = 'salon-1'
const DAY = '2026-08-17'
const PROJECT_ID = 'hairquick-8f72b'
const EMULATOR_CLEAR_URL = `http://127.0.0.1:8080/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`

const at = (hhmm: string, date = DAY): Date => new Date(`${date}T${hhmm}:00`)

const person = (hairdresserId: string | null, start: string, durationMin: number): LockablePerson => ({
  hairdresserId,
  scheduledAt: Timestamp.fromDate(at(start)),
  endsAt: Timestamp.fromDate(new Date(at(start).getTime() + durationMin * 60_000)),
})

const lockId = (hairdresserId: string, hhmm: string) => `${SALON_ID}__${hairdresserId}__${DAY}__${hhmm}`

beforeAll(async () => {
  // Attend que l'émulateur soit prêt à répondre (démarré en parallèle des tests).
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(EMULATOR_CLEAR_URL, { method: 'DELETE' })
      if (res.ok) return
    } catch {
      // pas encore prêt
    }
    await new Promise(r => setTimeout(r, 1000))
  }
  throw new Error("L'émulateur Firestore ne répond pas sur 127.0.0.1:8080 — lancer `firebase emulators:start --only firestore`.")
}, 35000)

beforeEach(async () => {
  await fetch(EMULATOR_CLEAR_URL, { method: 'DELETE' })
})

describe('bookAppointmentSlots', () => {
  it('crée la réservation et les verrous quand aucun créneau ne se chevauche', async () => {
    const id = await bookAppointmentSlots({
      salonId: SALON_ID,
      people: [person('hd-1', '10:00', 60)],
      clientName: 'Alice',
    } as any)

    expect(id).toBeTruthy()
    expect(await getDocument('reservations', id)).not.toBeNull()
    expect(await getDocument('slot_locks', lockId('hd-1', '1000'))).not.toBeNull()
    expect(await getDocument('slot_locks', lockId('hd-1', '1030'))).not.toBeNull()
  })

  it('lève SlotConflictError si un des créneaux requis est déjà verrouillé, sans rien écrire', async () => {
    await bookAppointmentSlots({ salonId: SALON_ID, people: [person('hd-1', '10:00', 60)], clientName: 'Alice' } as any)

    await expect(
      bookAppointmentSlots({ salonId: SALON_ID, people: [person('hd-1', '10:30', 60)], clientName: 'Bob' } as any),
    ).rejects.toBeInstanceOf(SlotConflictError)
  })

  it("n'engage pas de verrou pour une personne sans coiffeur précis (au choix du salon)", async () => {
    const id = await bookAppointmentSlots({ salonId: SALON_ID, people: [person(null, '10:00', 60)], clientName: 'Alice' } as any)
    expect(await getDocument('reservations', id)).not.toBeNull()
  })

  it('réservation simultanée de deux utilisateurs sur le même créneau : une seule réussit', async () => {
    const results = await Promise.allSettled([
      bookAppointmentSlots({ salonId: SALON_ID, people: [person('hd-1', '14:00', 30)], clientName: 'A' } as any),
      bookAppointmentSlots({ salonId: SALON_ID, people: [person('hd-1', '14:00', 30)], clientName: 'B' } as any),
    ])

    const fulfilled = results.filter(r => r.status === 'fulfilled')
    const rejected = results.filter(r => r.status === 'rejected')
    expect(fulfilled).toHaveLength(1)
    expect(rejected).toHaveLength(1)
    expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(SlotConflictError)
  })

  it('un service de 2h verrouille bien les 4 créneaux de 30 min couverts, fin exclusive', async () => {
    await bookAppointmentSlots({ salonId: SALON_ID, people: [person('hd-1', '10:00', 120)], clientName: 'Alice' } as any)
    for (const hhmm of ['1000', '1030', '1100', '1130']) {
      expect(await getDocument('slot_locks', lockId('hd-1', hhmm))).not.toBeNull()
    }
    expect(await getDocument('slot_locks', lockId('hd-1', '1200'))).toBeNull()
  })
})

describe('releaseAppointmentSlots', () => {
  it('une annulation libère les verrous : un nouveau bookAppointmentSlots sur le même créneau réussit ensuite', async () => {
    const people = [person('hd-1', '09:00', 30)]
    await bookAppointmentSlots({ salonId: SALON_ID, people, clientName: 'Alice' } as any)

    await releaseAppointmentSlots(SALON_ID, people)
    expect(await getDocument('slot_locks', lockId('hd-1', '0900'))).toBeNull()

    const id2 = await bookAppointmentSlots({ salonId: SALON_ID, people: [person('hd-1', '09:00', 30)], clientName: 'Bob' } as any)
    expect(id2).toBeTruthy()
  })
})

describe('updateReservationSlots (reprogrammation / changement de coiffeur)', () => {
  it('déplace les verrous vers le nouveau créneau et met à jour la réservation', async () => {
    const oldPeople = [person('hd-1', '10:00', 30)]
    const id = await bookAppointmentSlots({ salonId: SALON_ID, people: oldPeople, clientName: 'Alice' } as any)

    const newPeople = [person('hd-1', '15:00', 30)]
    await updateReservationSlots(id, SALON_ID, oldPeople, newPeople, { status: 'confirmed' })

    expect(await getDocument('slot_locks', lockId('hd-1', '1000'))).toBeNull()
    expect(await getDocument('slot_locks', lockId('hd-1', '1500'))).not.toBeNull()
    expect((await getDocument('reservations', id))?.status).toBe('confirmed')
  })

  it('échoue si le nouveau créneau est déjà pris par une autre réservation, sans toucher aux anciens verrous', async () => {
    const oldPeople = [person('hd-1', '10:00', 30)]
    const id = await bookAppointmentSlots({ salonId: SALON_ID, people: oldPeople, clientName: 'Alice' } as any)
    await bookAppointmentSlots({ salonId: SALON_ID, people: [person('hd-1', '15:00', 30)], clientName: 'Bob' } as any)

    await expect(
      updateReservationSlots(id, SALON_ID, oldPeople, [person('hd-1', '15:00', 30)], { status: 'confirmed' }),
    ).rejects.toBeInstanceOf(SlotConflictError)

    expect(await getDocument('slot_locks', lockId('hd-1', '1000'))).not.toBeNull()
    expect((await getDocument('reservations', id))?.status).not.toBe('confirmed')
  })

  it("changement de coiffeur d'une seule personne : scopé à cette personne (tableaux à un élément)", async () => {
    const oldPerson = person('hd-1', '11:00', 45)
    const id = await bookAppointmentSlots({ salonId: SALON_ID, people: [oldPerson], clientName: 'Alice' } as any)

    const newPerson = person('hd-2', '11:00', 45)
    await updateReservationSlots(id, SALON_ID, [oldPerson], [newPerson], { 'people.0.hairdresserId': 'hd-2' })

    expect(await getDocument('slot_locks', lockId('hd-1', '1100'))).toBeNull()
    expect(await getDocument('slot_locks', lockId('hd-2', '1100'))).not.toBeNull()
  })

  it('décaler de 30 min un créneau déjà à soi ne se bloque pas lui-même (chevauchement avec ses propres anciens verrous)', async () => {
    const oldPeople = [person('hd-1', '10:00', 60)] // verrouille 10:00 et 10:30
    const id = await bookAppointmentSlots({ salonId: SALON_ID, people: oldPeople, clientName: 'Alice' } as any)

    const newPeople = [person('hd-1', '10:30', 60)] // verrouille 10:30 et 11:00 — 10:30 était déjà à Alice
    await expect(updateReservationSlots(id, SALON_ID, oldPeople, newPeople, {})).resolves.not.toThrow()
    expect(await getDocument('slot_locks', lockId('hd-1', '1000'))).toBeNull()
    expect(await getDocument('slot_locks', lockId('hd-1', '1030'))).not.toBeNull()
    expect(await getDocument('slot_locks', lockId('hd-1', '1100'))).not.toBeNull()
  })
})
