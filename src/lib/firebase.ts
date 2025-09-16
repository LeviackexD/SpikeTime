
import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
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
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

// Enable offline persistence for Firestore.
// This is done after emulator connection to avoid conflicts.
try {
    enableMultiTabIndexedDbPersistence(db);
} catch (error: any) {
    if (error.code == 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (error.code == 'unimplemented') {
        console.log('The current browser does not support all of the features required to enable persistence.');
    }
}


export { app, db, auth };
