
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, enableMultiTabIndexedDbPersistence, Timestamp } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";


// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


// Connect to emulators if in development AND not in a test environment
if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && typeof process.env.JEST_WORKER_ID === 'undefined') {
  console.log('Connecting to Firebase Emulators');
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectStorageEmulator(storage, "127.0.0.1", 9199);


    // This enables offline persistence and multi-tab support
    enableMultiTabIndexedDbPersistence(db)
      .catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Firestore multi-tab persistence failed: multiple tabs open. Some features may not work.');
        } else if (err.code === 'unimplemented') {
          console.warn('Firestore persistence not available in this browser.');
        }
      });
  } catch(e) {
    console.warn("Could not connect to emulators, this is expected if they are not running", e)
  }
}


export { app, auth, db, storage, Timestamp };
