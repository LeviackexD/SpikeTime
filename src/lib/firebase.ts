
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  "projectId": "spiketime-8retn",
  "appId": "1:662625552477:web:42463451e309e268a765b4",
  "storageBucket": "spiketime-8retn.firebasestorage.app",
  "apiKey": "AIzaSyBFd6lo5OJuLABP-_rUO8Zl69WjhxvvA_4",
  "authDomain": "spiketime-8retn.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "662625552477"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
