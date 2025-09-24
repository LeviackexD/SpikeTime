// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, enableMultiTabIndexedDbPersistence, Timestamp } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyBFd6lo5OJuLABP-_rUO8Zl69WjhxvvA_4",
  authDomain: "spiketime-8retn.firebaseapp.com",
  databaseURL: "https://spiketime-8retn-default-rtdb.firebaseio.com",
  projectId: "spiketime-8retn",
  storageBucket: "spiketime-8retn.firebasestorage.app",
  messagingSenderId: "662625552477",
  appId: "1:662625552477:web:3100fccb92648c09a765b4"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators if in development AND not in a test environment
if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && typeof process.env.JEST_WORKER_ID === 'undefined') {
  console.log('Connecting to Firebase Emulators');
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);

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


export { app, auth, db, Timestamp };
