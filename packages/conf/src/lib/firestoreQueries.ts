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
  QueryConstraint,
  collectionGroup,
  Firestore,
} from "@firebase/firestore";

// Types
type FirestoreData = Record<string, any>;

export interface PaginateOptions {
  page?: number;
  pageSize?: number;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  constraints?: QueryConstraint[];
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
  };
}
