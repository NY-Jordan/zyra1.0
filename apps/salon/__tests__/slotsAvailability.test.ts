import { describe, it, expect, vi } from 'vitest'

// Fonctions pures — pas de mock nécessaire pour la logique elle-même, mais le
// module importe `@zyra/conf/lib/firebase` (pour le hook temps réel qui vit
// dans le même fichier) : on le mocke pour éviter toute init Firebase réelle
// pendant les tests unitaires.
vi.mock('@zyra/conf/lib/firebase', () => ({ db: {} }))

import {
  intervalsOverlap,
  isRangeFree,
  getWorkingIntervals,
  isServiceBookable,
  computeBookableStarts,
  toDateKey,
} from '@zyra/core/usecases/slotsUseCases'
import { OpeningHour } from '@zyra/conf/domain/entities/salons.entities'
import { IHairdresserAbsence } from '@zyra/conf/domain/entities/availability.entities'

// ─── Fixtures ───────────────────────────────────────────────────────────────
// Date arbitraire ; le nom du jour est dérivé de la même façon que le code
// source, donc le test ne dépend pas de savoir quel jour de semaine c'est.
const DATE = new Date(2026, 7, 17) // 17 août 2026, minuit local
const DAY = DATE.toLocaleDateString('en-EN', { weekday: 'long' }).toLowerCase()
const OTHER_DAY = DAY === 'monday' ? 'tuesday' : 'monday'

const at = (hhmm: string): Date => {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(DATE)
  d.setHours(h, m, 0, 0)
  return d
}

const ms = (hhmm: string) => at(hhmm).getTime()

const salonOpen: OpeningHour[] = [{ day: DAY, open: '09:00', close: '18:00', openDay: true }]
const salonClosed: OpeningHour[] = [{ day: DAY, open: '09:00', close: '18:00', openDay: false }]

const absence = (overrides: Partial<IHairdresserAbsence> = {}): IHairdresserAbsence => ({
  id: 'abs-1',
  salonId: 'salon-1',
  hairdresserId: 'hd-1',
  date: toDateKey(DATE),
  allDay: false,
  createdAt: null as any,
  ...overrides,
})

// ─────────────────────────────────────────────────────────────────────────────
describe('intervalsOverlap — A.start < B.end && A.end > B.start', () => {
  it('deux intervalles disjoints ne se chevauchent pas', () => {
    expect(intervalsOverlap({ start: ms('09:00'), end: ms('10:00') }, { start: ms('11:00'), end: ms('12:00') })).toBe(false)
  })

  it("un RDV qui commence exactement à la fin d'un autre n'est pas un chevauchement (back-to-back)", () => {
    expect(intervalsOverlap({ start: ms('10:00'), end: ms('12:00') }, { start: ms('12:00'), end: ms('13:00') })).toBe(false)
  })

  it('chevauchement partiel (le nouveau commence pendant un RDV existant)', () => {
    expect(intervalsOverlap({ start: ms('11:00'), end: ms('13:00') }, { start: ms('10:00'), end: ms('12:00') })).toBe(true)
  })

  it('chevauchement partiel (le nouveau finit pendant un RDV existant)', () => {
    expect(intervalsOverlap({ start: ms('09:00'), end: ms('11:00') }, { start: ms('10:00'), end: ms('12:00') })).toBe(true)
  })

  it('un RDV qui englobe complètement un autre est en conflit', () => {
    expect(intervalsOverlap({ start: ms('09:00'), end: ms('18:00') }, { start: ms('10:00'), end: ms('12:00') })).toBe(true)
  })

  it('un RDV complètement englobé par un autre est en conflit', () => {
    expect(intervalsOverlap({ start: ms('10:30'), end: ms('11:00') }, { start: ms('10:00'), end: ms('12:00') })).toBe(true)
  })

  it('cas limite exact 12:00 : deux RDV qui se touchent pile à 12:00 ne sont pas en conflit', () => {
    expect(intervalsOverlap({ start: ms('09:00'), end: ms('12:00') }, { start: ms('12:00'), end: ms('17:00') })).toBe(false)
  })
})

describe('isRangeFree', () => {
  it('libre quand aucun intervalle occupé ne chevauche', () => {
    expect(isRangeFree({ start: ms('12:00'), end: ms('14:00') }, [{ start: ms('10:00'), end: ms('12:00') }])).toBe(true)
  })

  it("non libre si un seul intervalle occupé chevauche", () => {
    expect(
      isRangeFree({ start: ms('11:00'), end: ms('13:00') }, [
        { start: ms('09:00'), end: ms('10:00') },
        { start: ms('10:00'), end: ms('12:00') },
      ]),
    ).toBe(false)
  })
})

describe("getWorkingIntervals — pauses, absences, jours fermés", () => {
  it('salon fermé ce jour → aucun intervalle', () => {
    expect(getWorkingIntervals(DATE, salonClosed, null, [])).toEqual([])
  })

  it("professionnel ne travaillant pas ce jour (mais salon ouvert) → aucun intervalle", () => {
    const hdHours: OpeningHour[] = [{ day: OTHER_DAY, open: '09:00', close: '17:00', openDay: true }]
    expect(getWorkingIntervals(DATE, salonOpen, hdHours, [])).toEqual([])
  })

  it('sans pause ni absence → un seul intervalle = horaires du jour', () => {
    expect(getWorkingIntervals(DATE, salonOpen, null, [])).toEqual([{ start: ms('09:00'), end: ms('18:00') }])
  })

  it('une pause coupe la journée en deux intervalles', () => {
    const withBreak: OpeningHour[] = [{ day: DAY, open: '09:00', close: '18:00', openDay: true, breaks: [{ start: '12:00', end: '13:00' }] }]
    expect(getWorkingIntervals(DATE, withBreak, null, [])).toEqual([
      { start: ms('09:00'), end: ms('12:00') },
      { start: ms('13:00'), end: ms('18:00') },
    ])
  })

  it('professionnel absent toute la journée → aucun intervalle', () => {
    expect(getWorkingIntervals(DATE, salonOpen, null, [absence({ allDay: true })])).toEqual([])
  })

  it('professionnel absent sur une plage précise → intervalle réduit en conséquence', () => {
    const result = getWorkingIntervals(DATE, salonOpen, null, [absence({ allDay: false, range: { start: '14:00', end: '16:00' } })])
    expect(result).toEqual([
      { start: ms('09:00'), end: ms('14:00') },
      { start: ms('16:00'), end: ms('18:00') },
    ])
  })

  it("une absence un autre jour n'affecte pas ce jour", () => {
    const result = getWorkingIntervals(DATE, salonOpen, null, [absence({ allDay: true, date: '2099-01-01' })])
    expect(result).toEqual([{ start: ms('09:00'), end: ms('18:00') }])
  })
})

describe('isServiceBookable — la durée complète doit tenir, pas juste le début', () => {
  // Reproduit l'exemple de la consigne : salon 09:00→18:00, pro 09:00→17:00,
  // service 2h, RDV existant 10:00→12:00.
  const workingIntervals = getWorkingIntervals(DATE, salonOpen, [{ day: DAY, open: '09:00', close: '17:00', openDay: true }], [])
  const busy = [{ start: ms('10:00'), end: ms('12:00') }]
  const DURATION = 120

  it('09:00 → 11:00 chevauche le RDV existant : indisponible', () => {
    expect(isServiceBookable(at('09:00'), DURATION, workingIntervals, busy)).toBe(false)
  })

  it('10:00 → 12:00 est exactement le RDV existant : indisponible', () => {
    expect(isServiceBookable(at('10:00'), DURATION, workingIntervals, busy)).toBe(false)
  })

  it('11:00 → 13:00 chevauche la fin du RDV existant : indisponible', () => {
    expect(isServiceBookable(at('11:00'), DURATION, workingIntervals, busy)).toBe(false)
  })

  it('12:00 → 14:00 commence juste après le RDV existant : disponible', () => {
    expect(isServiceBookable(at('12:00'), DURATION, workingIntervals, busy)).toBe(true)
  })

  it("un créneau entièrement disponible est disponible", () => {
    expect(isServiceBookable(at('14:00'), DURATION, workingIntervals, busy)).toBe(true)
  })

  it("un créneau partiellement disponible (déborde sur le RDV existant) est indisponible", () => {
    expect(isServiceBookable(at('09:30'), 60, workingIntervals, busy)).toBe(false)
  })

  it('service trop long pour les horaires restants du professionnel (ferme à 17:00) : 16:00 + 2h dépasse', () => {
    expect(isServiceBookable(at('16:00'), DURATION, workingIntervals, [])).toBe(false)
  })

  it('limite exacte de fin de journée : le dernier créneau qui se termine pile à la fermeture est disponible', () => {
    expect(isServiceBookable(at('15:00'), DURATION, workingIntervals, [])).toBe(true) // 15:00→17:00 = fermeture pile
  })

  it("un cran après la limite de fin de journée est indisponible", () => {
    expect(isServiceBookable(at('15:30'), DURATION, workingIntervals, [])).toBe(false) // 15:30→17:30 dépasse 17:00
  })

  it('back-to-back : un RDV qui commence pile à la fin du précédent est disponible', () => {
    expect(isServiceBookable(at('12:00'), 60, workingIntervals, busy)).toBe(true)
  })

  it('changement de durée du même service : 30 min à 16:30 est disponible, 90 min à 16:30 ne l’est plus', () => {
    expect(isServiceBookable(at('16:30'), 30, workingIntervals, [])).toBe(true)
    expect(isServiceBookable(at('16:30'), 90, workingIntervals, [])).toBe(false)
  })

  it('une pause du professionnel bloque un créneau qui tombe dedans', () => {
    const withBreak = getWorkingIntervals(
      DATE,
      salonOpen,
      [{ day: DAY, open: '09:00', close: '17:00', openDay: true, breaks: [{ start: '12:00', end: '13:00' }] }],
      [],
    )
    expect(isServiceBookable(at('12:00'), 30, withBreak, [])).toBe(false)
  })

  it('une pause du professionnel bloque un créneau qui l’enjambe (commence avant, finit pendant)', () => {
    const withBreak = getWorkingIntervals(
      DATE,
      salonOpen,
      [{ day: DAY, open: '09:00', close: '17:00', openDay: true, breaks: [{ start: '12:00', end: '13:00' }] }],
      [],
    )
    expect(isServiceBookable(at('11:30'), 60, withBreak, [])).toBe(false)
  })

  it('professionnel absent (plage précise) : un créneau dans cette plage est indisponible', () => {
    const withAbsence = getWorkingIntervals(DATE, salonOpen, null, [absence({ range: { start: '14:00', end: '16:00' } })])
    expect(isServiceBookable(at('14:30'), 30, withAbsence, [])).toBe(false)
  })

  it('professionnel absent toute la journée : aucun créneau disponible quelle que soit la durée', () => {
    const withAbsence = getWorkingIntervals(DATE, salonOpen, null, [absence({ allDay: true })])
    expect(isServiceBookable(at('09:00'), 30, withAbsence, [])).toBe(false)
  })
})

describe('computeBookableStarts — grille de créneaux réservables', () => {
  const schedule = { open: '09:00', close: '17:00' }
  const workingIntervals = getWorkingIntervals(DATE, salonOpen, [{ day: DAY, open: '09:00', close: '17:00', openDay: true }], [])

  it("l'exemple exact de la consigne : service 2h, RDV 10:00-12:00", () => {
    const busy = [{ start: ms('10:00'), end: ms('12:00') }]
    const starts = computeBookableStarts(DATE, schedule, workingIntervals, busy, 120)
    expect(starts).not.toContain('09:00')
    expect(starts).not.toContain('10:00')
    expect(starts).not.toContain('11:00')
    expect(starts).toContain('12:00')
  })

  it('plusieurs RDV consécutifs : le service ne peut se placer qu’après le dernier', () => {
    const busy = [
      { start: ms('09:00'), end: ms('10:00') },
      { start: ms('10:00'), end: ms('11:00') },
      { start: ms('11:00'), end: ms('12:30') },
    ]
    const starts = computeBookableStarts(DATE, schedule, workingIntervals, busy, 30)
    expect(starts).not.toContain('12:00') // encore couvert par le 3e RDV (11:00→12:30)
    expect(starts).toContain('12:30')
  })

  it('services de durées différentes sur le même horaire donnent des grilles différentes', () => {
    const busy = [{ start: ms('10:00'), end: ms('11:00') }]
    const shortService = computeBookableStarts(DATE, schedule, workingIntervals, busy, 30)
    const longService = computeBookableStarts(DATE, schedule, workingIntervals, busy, 180)
    expect(shortService).toContain('09:30') // 09:30 + 30 min = 10:00, juste avant le RDV existant
    expect(longService).not.toContain('09:30') // 09:30 + 3h = 12:30, chevauche le RDV 10:00-11:00
  })

  it('aucun intervalle de travail (jour fermé) → aucun créneau réservable', () => {
    expect(computeBookableStarts(DATE, schedule, [], [], 30)).toEqual([])
  })

  it('durée nulle ou négative → aucun créneau réservable', () => {
    expect(computeBookableStarts(DATE, schedule, workingIntervals, [], 0)).toEqual([])
  })
})

describe('réservation simultanée — deux candidats sur le même créneau', () => {
  it("si un des deux RDV est déjà pris en compte comme occupé, le second n'est plus réservable", () => {
    const workingIntervals = [{ start: ms('09:00'), end: ms('18:00') }]
    // Le premier utilisateur vient de "gagner" le créneau 10:00-11:00 (déjà reflété dans busy).
    const busyAfterFirstBooking = [{ start: ms('10:00'), end: ms('11:00') }]
    expect(isServiceBookable(at('10:00'), 60, workingIntervals, busyAfterFirstBooking)).toBe(false)
  })
})
