import { createFirestoreQueries } from '@zyra/conf/lib/firestoreQueries';

import { db } from './firebase';

export const {
  fetchCollection,
  fetchCollectionPaginate,
  fetchSubCollection,
  fetchAllSubCollections,
  getDocument,
  createDocument,
  createSubCollectionDocument,
  editDocument,
  updateSubCollectionDocument,
  deleteDocument,
} = createFirestoreQueries(db);
