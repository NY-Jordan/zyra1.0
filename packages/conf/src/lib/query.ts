import { db } from "./firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  setDoc,
  QueryConstraint,
} from "@firebase/firestore";

// Types
type FirestoreData = Record<string, any>;

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
