import { db } from "./firebase";
import { createFirestoreQueries } from "./firestoreQueries";

// Web app's default instance — unchanged call sites (`import { fetchCollection }
// from '@zyra/conf/lib/query'`) keep working exactly as before. Other apps
// (mobile, ...) should import `createFirestoreQueries` from `./firestoreQueries`
// directly and bind it to their own Firebase instance instead of importing this
// file, which pulls in the web app's Firebase initialization as a side effect.
export const {
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
} = createFirestoreQueries(db);
