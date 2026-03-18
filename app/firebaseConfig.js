import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 
import { getAuth } from "firebase/auth"; 

const firebaseConfig = {
  apiKey: "AIzaSyDSW4y0G_-PQ-xho4uFlZpAWqfI5pxj2g4",
  authDomain: "gwct-36433.firebaseapp.com",
  projectId: "gwct-36433",
  storageBucket: "gwct-36433.firebasestorage.app",
  messagingSenderId: "633629068831",
  appId: "1:633629068831:web:297dc537c2d03fac19cf2a",
  measurementId: "G-SCWQBD9RJ1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the database and authentication instances so the rest of the app can use them
export const db = getFirestore(app);
export const auth = getAuth(app);