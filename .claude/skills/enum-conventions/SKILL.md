---
name: enum-conventions
description: >-
  Audits and enforces the Zyra monorepo convention of using shared TS enums
  from @zyra/conf instead of hardcoded string literals for status/type
  comparisons (order status, reservation status, member status, roles,
  payment methods, activity types, etc). Use when writing code that compares
  a `.status`, `.type`, `.role`, or `.paymentMethod` field against a string,
  when adding a new status-like field to a domain entity, or when asked to
  audit the codebase (apps/salon, apps/mobile, packages/*) for hardcoded
  status strings.
---

# Enum conventions (Zyra monorepo)

## The rule

Never compare a domain status/type field against a raw string literal
(`order.status === 'completed'`). Always compare against a named enum member
imported from `@zyra/conf/domain/enums/*` (`order.status === orderStatusEnum.completed`).

Rationale: a raw string literal has no single source of truth — a typo
(`'compelted'`) or a renamed value silently breaks comparisons with no
compiler error. An enum member is refactor-safe: renaming the enum value
updates every call site, and `find-usages` actually finds every call site.

This applies across the whole monorepo: `apps/salon` (Next.js web),
`apps/mobile` (Expo/React Native), and any code in `packages/*`. Both apps
consume the same `@zyra/conf` domain layer, so the enum only needs to be
defined once.

## Where the enums live

`packages/conf/src/domain/enums/`:

| File | Enum | Covers |
|---|---|---|
| `ReservationEnum.ts` | `reservationStatusEnum` | `pending`, `confirmed`, `checked_in`, `no_show`, `rescheduled`, `completed`, `canceled` |
| `ReservationEnum.ts` | `reservationPaymentMethodEnum` | `cash`, `mobile`, `card` |
| `OrderEnum.ts` | `orderStatusEnum` | `pending`, `completed`, `canceled` |
| `OrderEnum.ts` | `orderPaymentMethodEnum` | `cash`, `mobile` |
| `MemberEnum.ts` | `memberStatusEnum` | `active`, `invited`, `suspended` |
| `MemberEnum.ts` | `invitationStatusEnum` | `pending`, `accepted`, `rejected`, `expired` |
| `statusEnum.ts` | `SalonStatusEnum` | `active`, `suspended`, `deleted`, `payment` |
| `permissions.entities.ts` | `RoleId` (union type, not enum — `ROLE_IDS` array is the reusable source of truth) | `owner`, `manager`, `receptionist`, `hairdresser` |

Import from the app side via the `@zyra/conf/domain/enums/*` (or
`@zyra/conf/domain/entities/*` for `permissions.entities`) subpath — the
package's `exports` map (`"./*"`) resolves any `src/**/*.ts` file, so this
works from both Next.js (webpack, via the `tsconfig.json` path alias) and
Expo (Metro, via real package resolution).

Note: the underlying entity field types (e.g. `IOrder.status`) are still
declared as inline string-literal unions (`'pending' | 'completed' |
'canceled'`), not the enum type itself — changing that is a bigger, riskier
type-level migration (see "What NOT to do" below). Comparing a `string`-typed
field against an enum member with `===` still type-checks fine; that's the
supported pattern here.

## What to do when auditing

1. Grep for the anti-pattern across the target directory:
   ```
   grep -rEn "\.(status|type|role|paymentMethod)\s*===?\s*['\"][a-zA-Z_]+['\"]" <dir> --include="*.tsx" --include="*.ts"
   ```
   Also check object-literal lookup maps keyed by raw strings (e.g.
   `{ completed: {...}, pending: {...} }` used as a status→label/color map) —
   these should be typed `Record<orderStatusEnum, ...>` (or the relevant enum)
   instead of `Record<string, ...>`, which forces every key to be validated
   against the enum at compile time.

2. For each hit, replace the raw string with the matching enum member. If no
   enum exists yet for that field, add one to `packages/conf/src/domain/enums/`
   following the existing file naming (`<Domain>Enum.ts`) and export style
   (`export enum fooEnum { key = 'value', ... }`, lowercase-first enum name
   matching the existing `reservationStatusEnum`/`SalonStatusEnum` mix — match
   whatever casing convention the specific file already uses).

3. Re-run `tsc --noEmit` in the affected app(s) after the change — comparisons
   between a `string`-typed field and an enum member are allowed, so this
   should never produce new type errors. If it does, the field's declared
   type is narrower than the enum (fix the entity type instead of casting).

## What NOT to do

- Don't change `IOrder.status`/`ISalonMember.status`/etc.'s declared type from
  a string-literal union to the enum type itself in one sweep — every existing
  object literal in the web app that writes `status: 'completed'` directly
  (not through the enum) would need updating too, and that's a much larger,
  separate change. Add/use the enum for **comparisons**; leave the **field
  type** as the existing union unless doing a deliberate, scoped migration of
  the writers too.
- Don't introduce a second, competing enum/union for the same concept in
  `apps/mobile` or `apps/salon` — always check `packages/conf/src/domain/enums/`
  and `packages/conf/src/domain/entities/*.entities.ts` first (this is the
  mistake that motivated this skill: `apps/mobile` initially redefined its own
  `ReservationStatus`/`MemberStatus`-shaped string unions instead of importing
  the real ones).
