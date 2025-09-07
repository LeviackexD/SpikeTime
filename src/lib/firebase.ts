// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
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

export { app };
