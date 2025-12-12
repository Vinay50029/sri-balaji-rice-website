// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAiog4XGw99shIo9Rdrd3Tx6EK-1nAHXTI",
  authDomain: "sri-balaji-traders-1.firebaseapp.com",
  projectId: "sri-balaji-traders-1",
  storageBucket: "sri-balaji-traders-1.firebasestorage.app",
  messagingSenderId: "877142947078",
  appId: "1:877142947078:web:025204b7b2665b3950da87",
  measurementId: "G-CLY52M3H08"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export Firebase services
export const db = getFirestore(app);      // Firestore Database
export const auth = getAuth(app);         // Authentication (for your father's login)