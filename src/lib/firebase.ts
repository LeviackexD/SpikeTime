// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
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

// Initialize Firestore with long-polling compatibility
const firestore = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});

// Initialize Realtime Database
const db = getDatabase(app);

export { app, auth, firestore, db };
