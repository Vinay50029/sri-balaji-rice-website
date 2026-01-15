import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// configuring the connection to the firebase backend
// these keys are safe to be public as we use rules to secure data
const firebaseConfig = {
  apiKey: "AIzaSyAiog4XGw99shIo9Rdrd3Tx6EK-1nAHXTI",
  authDomain: "sri-balaji-traders-1.firebaseapp.com",
  projectId: "sri-balaji-traders-1",
  storageBucket: "sri-balaji-traders-1.firebasestorage.app",
  messagingSenderId: "877142947078",
  appId: "1:877142947078:web:025204b7b2665b3950da87",
  measurementId: "G-CLY52M3H08"
};

// initializing the firebase app
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// exporting database and auth to use in other files
export const db = getFirestore(app);
export const auth = getAuth(app);