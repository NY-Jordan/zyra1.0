import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";

export  const firebaseConfig = {
  apiKey: "AIzaSyA_Avgffid_W3vNna8ZPwLh0nRScIcNZ6o",
  authDomain: "hairquick-8f72b.firebaseapp.com",
  projectId: "hairquick-8f72b",
  storageBucket: "hairquick-8f72b.appspot.com",
  messagingSenderId: "975215169664",
  appId: "1:975215169664:web:21440a5fd697c641741665",
  measurementId: "G-P5XKHEF4WJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage();

connectAuthEmulator(auth, "http://localhost:9099");
connectFirestoreEmulator(db, "localhost", 8080);
connectStorageEmulator(storage, "localhost", 9199);

export { auth, db, storage };
