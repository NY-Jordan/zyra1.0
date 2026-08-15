import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  serverTimestamp,
  updateDoc,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  setDoc,
  runTransaction,
  Timestamp,
  QueryConstraint,
  collectionGroup,
  Firestore,
} from "firebase/firestore";

// Types
type FirestoreData = Record<string, any>;

export interface PaginateOptions {
  page?: number;
  pageSize?: number;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  constraints?: QueryConstraint[];
}

/** Levée quand un créneau demandé vient d'être pris par quelqu'un d'autre (détecté dans la transaction). */
export class SlotConflictError extends Error {
  constructor(message = "Ce créneau vient d'être réservé par quelqu'un d'autre.") {
    super(message);
    this.name = 'SlotConflictError';
  }
}

/** Le strict nécessaire pour verrouiller un créneau : coiffeur + plage horaire d'une personne d'une réservation. */
export interface LockablePerson {
  hairdresserId?: string | null;
  scheduledAt: Timestamp;
  endsAt: Timestamp;
}

/**
 * Builds the CRUD helpers below bound to a specific Firestore instance. Every
 * app (web, mobile, ...) has its own Firebase app/persistence setup, but the
 * query logic itself is identical — this factory is the single source of
 * truth so nobody re-implements Firestore calls per platform.
 *
 * This file must stay free of any `./firebase` import: it needs to be usable
 * without pulling in another app's Firebase initialization (e.g. the web
 * app's emulator hosts, which don't apply to a mobile device).
 */
export function createFirestoreQueries(db: Firestore) {
  /**
   * Crée un document dans une sous-collection d'un document parent
   * @param parentCollectionName - Nom de la collection parent (ex: "coiffeurs")
   * @param parentDocId - ID du document parent (ex: coiffeurId)
   * @param subCollectionName - Nom de la sous-collection (ex: "salons")
   * @param data - Données à stocker dans le document
   * @param docName - Optionnel : nom du document à créer dans la sous-collection
   */
  const createSubCollectionDocument = async (
    parentCollectionName: string,
    parentDocId: string,
    subCollectionName: string,
    data: FirestoreData,
    docName?: string
  ): Promise<string> => {
    const parentDocRef = doc(db, parentCollectionName, parentDocId);
    const subCollectionRef = collection(parentDocRef, subCollectionName);

    if (docName) {
      const docRef = doc(subCollectionRef, docName);
      await setDoc(docRef, {
        ...data,
        id: docName,
        createdAt: serverTimestamp(),
        timestamp: serverTimestamp(),
      });
      return docName;
    } else {
      const docRef = await addDoc(subCollectionRef, {
        ...data,
        createdAt: serverTimestamp(),
        timestamp: serverTimestamp(),
      });
      await updateDoc(docRef, { id: docRef.id });
      return docRef.id;
    }
  };

  const fetchAllSubCollections = async (
    subCollectionName: string,
    constraints: QueryConstraint[] = []
  ): Promise<FirestoreData[]> => {
    const subCollectionGroupQuery = query(
      collectionGroup(db, subCollectionName),
      ...constraints
    );

    const snapshot = await getDocs(subCollectionGroupQuery);

    return snapshot.docs.map(doc => ({
      parentId: doc.ref.parent.parent?.id,
      subDocId: doc.id,
      ...doc.data()
    }));
  };

  /**
   * Récupère les documents d'une sous-collection avec des contraintes optionnelles
   * @param parentCollectionName - Nom de la collection parent (ex: "coiffeurs")
   * @param parentDocId - ID du document parent (ex: coiffeurId)
   * @param subCollectionName - Nom de la sous-collection (ex: "salons")
   * @param constraints - Tableau de QueryConstraint (ex: where(), orderBy(), limit())
   */
  const fetchSubCollection = async (
    parentCollectionName: string,
    parentDocId: string,
    subCollectionName: string,
    constraints: QueryConstraint[] = []
  ): Promise<FirestoreData[]> => {
    const subCollectionRef = collection(db, parentCollectionName, parentDocId, subCollectionName);
    const subCollectionQuery = query(subCollectionRef, ...constraints);
    const snapshot = await getDocs(subCollectionQuery);

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  /**
   * Met à jour un document dans une sous-collection d'un document parent
   * @param parentCollectionName - Nom de la collection parent (ex: "coiffeurs")
   * @param parentDocId - ID du document parent (ex: coiffeurId)
   * @param subCollectionName - Nom de la sous-collection (ex: "salons")
   * @param subDocId - ID du document à mettre à jour dans la sous-collection
   * @param data - Données à mettre à jour
   */
  const updateSubCollectionDocument = async (
    parentCollectionName: string,
    parentDocId: string,
    subCollectionName: string,
    subDocId: string,
    data: FirestoreData
  ): Promise<void> => {
    const docRef = doc(db, parentCollectionName, parentDocId, subCollectionName, subDocId);
    await updateDoc(docRef, data);
  };

  const createDocument = async (
    collectionName: string,
    data: FirestoreData,
    docName?: string
  ): Promise<string> => {
    const collectionRef = collection(db, collectionName);
    if (docName) {
      const docRef = doc(db, collectionName, docName);
      await setDoc(docRef, {
        ...data,
        id: docName,
        createdAt: serverTimestamp(),
        timestamp: serverTimestamp(),
      });
      return docName;
    } else {
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: serverTimestamp(),
        timestamp: serverTimestamp(),
      });
      await updateDoc(docRef, { id: docRef.id });
      return docRef.id;
    }
  };

  const fetchCollection = async (
    collectionName: string,
    constraints: QueryConstraint[] = []
  ): Promise<FirestoreData[]> => {
    const collectionRef = collection(db, collectionName);
    const collectionQuery = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(collectionQuery);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  };

  /**
   * Fetch data from a Firestore collection with pagination.
   */
  const fetchCollectionPaginate = async (
    collectionName: string,
    {
      page = 1,
      pageSize = 10,
      orderByField = "createdAt",
      orderDirection = 'desc',
      constraints = [],
    }: PaginateOptions = {}
  ): Promise<{ data: FirestoreData[]; total: number }> => {
    const collectionRef = collection(db, collectionName);

    const countQuery = query(collectionRef, ...constraints);
    const countSnap = await getCountFromServer(countQuery);
    const total = countSnap.data().count;

    let q = query(
      collectionRef,
      ...constraints,
      orderBy(orderByField, orderDirection),
      limit(pageSize)
    );
    if (page > 1) {
      const prevDocsSnap = await getDocs(
        query(
          collectionRef,
          ...constraints,
          orderBy(orderByField, orderDirection),
          limit((page - 1) * pageSize)
        )
      );
      const lastVisible = prevDocsSnap.docs[prevDocsSnap.docs.length - 1];
      if (lastVisible) {
        q = query(
          collectionRef,
          ...constraints,
          orderBy(orderByField, orderDirection),
          startAfter(lastVisible),
          limit(pageSize)
        );
      }
    }
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { data, total };
  };

  const getDocument = async (
    collectionName: string,
    docId: string
  ): Promise<FirestoreData | null> => {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    } else {
      return null;
    }
  };

  const editDocument = async (
    collectionName: string,
    docId: string,
    data: FirestoreData
  ): Promise<void> => {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
  };

  const deleteDocument = async (
    collectionName: string,
    docId: string
  ): Promise<void> => {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  };

  // ─── Verrous de créneaux (intégrité transactionnelle) ──────────────────────
  //
  // Un document `slot_locks` par unité de 30 min réellement occupée par un
  // coiffeur, à ID déterministe — pas de grille stockée à l'avance, juste les
  // créneaux effectivement pris. `runTransaction` garantit qu'entre deux
  // écritures concurrentes sur le même créneau, une seule peut réussir : la
  // perdante relit un verrou déjà posé et échoue proprement (voir
  // `SlotConflictError`) au lieu d'écrire une double réservation.
  //
  // Les personnes en "au choix du salon" (`hairdresserId` absent) ne sont pas
  // verrouillées : aucune ressource précise n'est engagée tant qu'un coiffeur
  // précis n'est pas assigné.

  const SLOT_LOCK_STEP_MS = 30 * 60 * 1000;

  const pad2 = (n: number) => String(n).padStart(2, '0');

  // Miroir de `toDateKey` dans `@zyra/core/usecases/slotsUseCases` — ce fichier
  // ne peut pas importer `@zyra/core` (dépendance inverse), donc dupliqué ici
  // à l'identique ; garder les deux en phase si la convention change.
  const dateKeyOf = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

  /** IDs déterministes des verrous de 30 min couvrant [start, end) pour un coiffeur donné. */
  const lockDocIds = (salonId: string, hairdresserId: string, start: Date, end: Date): string[] => {
    const ids: string[] = [];
    let cur = new Date(start);
    while (cur.getTime() < end.getTime()) {
      const hhmm = `${pad2(cur.getHours())}${pad2(cur.getMinutes())}`;
      ids.push(`${salonId}__${hairdresserId}__${dateKeyOf(cur)}__${hhmm}`);
      cur = new Date(cur.getTime() + SLOT_LOCK_STEP_MS);
    }
    return ids;
  };

  const lockIdsForPeople = (salonId: string, people: LockablePerson[]): string[] =>
    people
      .filter((p): p is LockablePerson & { hairdresserId: string } => !!p.hairdresserId)
      .flatMap(p => lockDocIds(salonId, p.hairdresserId, p.scheduledAt.toDate(), p.endsAt.toDate()));

  /**
   * Crée une réservation et verrouille tous les créneaux de ses personnes (qui
   * ont un coiffeur précis) dans une seule transaction : si un seul créneau
   * est déjà verrouillé, rien n'est écrit et `SlotConflictError` est levée.
   */
  const bookAppointmentSlots = async (
    reservationData: FirestoreData & { salonId: string; people: LockablePerson[] }
  ): Promise<string> => {
    const reservationRef = doc(collection(db, 'reservations'));
    const lockIds = lockIdsForPeople(reservationData.salonId, reservationData.people);

    await runTransaction(db, async (tx) => {
      const lockRefs = lockIds.map(id => doc(db, 'slot_locks', id));
      const snaps = await Promise.all(lockRefs.map(ref => tx.get(ref)));
      if (snaps.some(s => s.exists())) throw new SlotConflictError();

      lockRefs.forEach(ref => tx.set(ref, { reservationId: reservationRef.id, salonId: reservationData.salonId, createdAt: serverTimestamp() }));
      tx.set(reservationRef, { ...reservationData, id: reservationRef.id, createdAt: serverTimestamp() });
    });

    return reservationRef.id;
  };

  /** Libère les verrous d'une réservation (annulation, no-show...). Pas besoin de transaction : une suppression sur un ID déterministe ne peut pas entrer en conflit. */
  const releaseAppointmentSlots = async (salonId: string, people: LockablePerson[]): Promise<void> => {
    const lockIds = lockIdsForPeople(salonId, people);
    await Promise.all(lockIds.map(id => deleteDoc(doc(db, 'slot_locks', id))));
  };

  /**
   * Déplace les verrous d'une réservation (reprogrammation globale, ou
   * changement de coiffeur/créneau d'une seule personne — passer alors des
   * tableaux à un seul élément) et met à jour le document en une seule
   * transaction. Les verrous déjà détenus par cette même réservation ne
   * comptent pas comme un conflit (ex: décaler de 30 min un créneau déjà à
   * soi) ; seuls les nouveaux créneaux réellement libres sont exigés.
   */
  const updateReservationSlots = async (
    reservationId: string,
    salonId: string,
    oldPeople: LockablePerson[],
    newPeople: LockablePerson[],
    updateData: FirestoreData,
  ): Promise<void> => {
    const oldLockIds = new Set(lockIdsForPeople(salonId, oldPeople));
    const newLockIds = Array.from(new Set(lockIdsForPeople(salonId, newPeople)));
    const idsToCheck = newLockIds.filter(id => !oldLockIds.has(id));

    await runTransaction(db, async (tx) => {
      const refsToCheck = idsToCheck.map(id => doc(db, 'slot_locks', id));
      const snaps = await Promise.all(refsToCheck.map(ref => tx.get(ref)));
      if (snaps.some(s => s.exists())) throw new SlotConflictError();

      oldLockIds.forEach(id => tx.delete(doc(db, 'slot_locks', id)));
      newLockIds.forEach(id => tx.set(doc(db, 'slot_locks', id), { reservationId, salonId, createdAt: serverTimestamp() }));
      tx.update(doc(db, 'reservations', reservationId), updateData);
    });
  };

  return {
    createSubCollectionDocument,
    fetchAllSubCollections,
    fetchSubCollection,
    updateSubCollectionDocument,
    createDocument,
    fetchCollection,
    fetchCollectionPaginate,
    getDocument,
    editDocument,
    deleteDocument,
    bookAppointmentSlots,
    releaseAppointmentSlots,
    updateReservationSlots,
  };
}
