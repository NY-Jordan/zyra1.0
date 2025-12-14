import { db } from "./firebase";
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
} from "@firebase/firestore";

// Types
type FirestoreData = Record<string, any>;




/**
 * Crée un document dans une sous-collection d'un document parent
 * @param parentCollectionName - Nom de la collection parent (ex: "coiffeurs")
 * @param parentDocId - ID du document parent (ex: coiffeurId)
 * @param subCollectionName - Nom de la sous-collection (ex: "salons")
 * @param data - Données à stocker dans le document
 * @param docName - Optionnel : nom du document à créer dans la sous-collection
 */
export const createSubCollectionDocument = async (
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



export const fetchAllSubCollections = async (
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
export const fetchSubCollection = async (
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
export const updateSubCollectionDocument = async (
  parentCollectionName: string,
  parentDocId: string,
  subCollectionName: string,
  subDocId: string,
  data: FirestoreData
): Promise<void> => {
  const docRef = doc(db, parentCollectionName, parentDocId, subCollectionName, subDocId);
  await updateDoc(docRef, data);
};


export const createDocument = async (
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

export const fetchCollection = async (
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

interface PaginateOptions {
  page?: number;
  pageSize?: number;
  orderByField?: string;
  constraints?: QueryConstraint[];
}

/**
 * Fetch data from a Firestore collection with pagination.
 */
export const fetchCollectionPaginate = async (
  collectionName: string,
  {
    page = 1,
    pageSize = 10,
    orderByField = "createdAt",
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
    orderBy(orderByField),
    limit(pageSize)
  );
  if (page > 1) {
    const prevDocsSnap = await getDocs(
      query(
        collectionRef,
        ...constraints,
        orderBy(orderByField),
        limit((page - 1) * pageSize)
      )
    );
    const lastVisible = prevDocsSnap.docs[prevDocsSnap.docs.length - 1];
    if (lastVisible) {
      q = query(
        collectionRef,
        ...constraints,
        orderBy(orderByField),
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

export const getDocument = async (
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

export const editDocument = async (
  collectionName: string,
  docId: string,
  data: FirestoreData
): Promise<void> => {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, data);
};

export const deleteDocument = async (
  collectionName: string,
  docId: string
): Promise<void> => {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
};
