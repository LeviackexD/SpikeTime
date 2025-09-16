import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, initializeFirestore, memoryLocalCache, persistentLocalCache, Firestore } from 'firebase/firestore';
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
const auth = getAuth(app);

let db: Firestore;

// Firestore uses a different cache implementation on the server-side.
if (typeof window === 'undefined') {
  db = initializeFirestore(app, {
    localCache: memoryLocalCache(),
  });
} else {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: 'multi-tab' }),
  });
}


// Connect to emulators in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Check if emulators are already running to avoid re-connecting
    // This is a common pattern to prevent errors in Next.js with HMR
    if (!auth.emulatorConfig) {
        connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    }
    // Firestore emulator connection doesn't have a check like auth, but we can wrap it.
    // A simple check is to see if the internal _settings.host has been set.
    // This is a bit of a hack, but it's effective.
    // @ts-ignore
    if (db._settings.host !== '127.0.0.1:8080') {
         connectFirestoreEmulator(db, '127.0.0.1', 8080);
    }
}


export { app, db, auth };
