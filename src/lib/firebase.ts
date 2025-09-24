// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, memoryLocalCache } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig: FirebaseOptions = {
  "projectId": "spiketime-8retn",
  "appId": "1:662625552477:web:fdf6fb4cb7af543ea765b4",
  "apiKey": "AIzaSyBFd6lo5OJuLABP-_rUO8Zl69WjhxvvA_4",
  "authDomain": "spiketime-8retn.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "662625552477"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
// Use memory cache to bypass corrupted IndexedDB cache.
const firestore = getFirestore(app, {
  localCache: memoryLocalCache(),
  experimentalAutoDetectLongPolling: true,
});
const db = getDatabase(app);

export { app, auth, firestore, db };
