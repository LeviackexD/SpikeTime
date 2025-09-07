
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
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

export { app, db, auth };
