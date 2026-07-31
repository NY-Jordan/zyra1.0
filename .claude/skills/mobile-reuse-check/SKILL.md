---
name: mobile-reuse-check
description: >-
  Enforces checking packages/core (usecases/hooks) and packages/conf
  (lib/query, lib/firestoreQueries, domain/entities) for existing reusable
  logic before writing a new service, hook, or Firestore query function in
  apps/mobile. Use before creating any file under apps/mobile/src/services,
  apps/mobile/src/hooks, or apps/mobile/src/lib, and before implementing any
  "create/update/delete X" or "fetch X" flow on mobile that has a web
  equivalent in apps/salon.
---

# Mobile reuse check (Zyra monorepo)

## The rule

Before writing a new function in `apps/mobile/src/services/*` (or a new hook),
check in this order:

1. **`packages/core/src/usecases/*.ts`** — does a hook already implement this
   exact business logic (e.g. `useHairDressers`, `ordersUseCases`,
   `clientsUseCases`)? If yes, read its `queryFn`/`mutationFn` body — that's
   the source of truth for the Firestore query shape (which collection,
   which `where()` clauses, which fields get written).
2. **`packages/conf/src/lib/query.ts` / `firestoreQueries.ts`** — is there
   already a generic CRUD helper (`fetchCollection`, `fetchSubCollection`,
   `fetchAllSubCollections`, `createDocument`, `editDocument`,
   `deleteDocument`, `fetchCollectionPaginate`) that does what you need? Don't
   write raw `firebase/firestore` calls (`collection()`, `query()`,
   `getDocs()`) directly in `apps/mobile` — always go through
   `@zyra/conf/lib/firestoreQueries`'s `createFirestoreQueries(db)` (mobile's
   own `db`), exposed as `apps/mobile/src/lib/query.ts`. See
   [[enum-conventions]] for the equivalent rule about enums.
3. **`packages/conf/src/domain/entities/*.entities.ts`** — does the type/enum
   you need already exist (`IOrder`, `IClient`, `IHairDresser`,
   `HairDresserSalonAssociation`, `ISalonMember`, ...)? Import it; don't
   redeclare a shape that duplicates an existing entity.

## Why a `packages/core` hook usually can't be imported as-is into mobile

Every hook in `packages/core/src/usecases/*` is built on `@tanstack/react-query`
(`useQuery`/`useMutation`) — `apps/mobile` doesn't have `@tanstack/react-query`
installed and isn't set up with a `QueryClientProvider`, so importing these
hooks directly won't work without adding that whole dependency (a bigger,
separate decision — don't do it silently as a side effect of one feature).

The fix is **not** to reimplement the Firestore calls from scratch. It's to:

1. Extract the `queryFn`/`mutationFn` body's logic (the `where()` clauses,
   the collection names, the object shape written) — that's plain
   TypeScript, no React involved.
2. Reimplement it as a plain `async function` in
   `apps/mobile/src/services/<name>Service.ts`, calling the same
   `fetchCollection`/`createDocument`/etc. from mobile's own
   `@/lib/query` (bound to mobile's Firebase instance, not the web one —
   see the `[firebase] Connecting to emulators at ...` incident: importing
   anything that pulls in `@zyra/conf/lib/firebase` as a side effect breaks
   mobile's emulator connection).
3. Call that plain function from a `useState`/`useEffect` or the existing
   `useAsyncData` hook (`apps/mobile/src/hooks/use-async-data.ts`) — mobile's
   established data-fetching pattern, no react-query needed.

Concrete examples from this codebase:
- `apps/mobile/src/services/hairdresserService.ts`'s `getBySalon` mirrors
  `useHairDressers`'s `queryFn` (the `fetchAllSubCollections` +
  per-association `fetchCollection` pattern) — same query shape, no
  react-query.
- `apps/mobile/src/services/orderService.ts`'s `createOrder` mirrors
  `NewOrderModal.tsx`'s `createOrderMutation.mutationFn` (price computation,
  `orders` + optional `clients` writes) line for line.
- `logActivity`/`getCurrentActor` in `packages/core/src/usecases/notificationsUseCases.ts`
  are already plain async functions (no React) — but they still import the
  **web-bound** `auth`/`createDocument` singletons, so they can't be imported
  into mobile directly either. `apps/mobile/src/services/activityService.ts`
  reimplements just `logActivity`'s payload shape, bound to mobile's own
  `auth`/`createDocument`.

## What NOT to do

- Don't add `@tanstack/react-query` to `apps/mobile` just to reuse one hook —
  that's a real architectural change (needs a `QueryClientProvider` at the
  root, cache invalidation strategy, etc.), not a one-line import.
- Don't write a new Firestore query by hand when `fetchCollection`/
  `fetchSubCollection`/etc. already covers it (see [[enum-conventions]] for
  the matching rule on hardcoded strings — the same "check first" spirit
  applies to queries).
- Don't duplicate a domain type (`IOrder`, `IClient`, ...) with a mobile-only
  shape "for convenience" — import the real one from `@zyra/conf`, even if it
  means handling a Firestore `Timestamp`-typed-as-`string` field (see
  `apps/mobile/src/lib/formatDate.ts` for the established pattern).
