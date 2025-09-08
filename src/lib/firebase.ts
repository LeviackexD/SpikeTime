
import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig: FirebaseOptions = {
  projectId: 'spiketime-8retn',
  appId: '1:662625552477:web:42463451e309e268a765b4',
  storageBucket: 'spiketime-8retn.firebasestorage.app',
  apiKey: 'AIzaSyBFd6lo5OJuLABP-_rUO8Zl69WjhxvvA_4',
  authDomain: 'spiketime-8retn.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '662625552477',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

// Connect to emulators in development
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  // @ts-ignore - _isInitialized is not in the public API but it's a reliable way to check
  if (!auth.emulatorConfig) {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  }
  // @ts-ignore
  if (!db._isInitialized) {
    connectFirestoreEmulator(db, 'localhost', 8080);
  }
}

export { app, db, auth };
