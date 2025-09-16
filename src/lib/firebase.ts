// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
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

export { app, auth, db };
