// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// In a real app, these would be stored in environment variables
const firebaseConfig = {
  apiKey: "AIzaSyAXW0-Qtbapj84cO9sl5MpeZ5z1NgXYQ7I",
  authDomain: "prepwise-mvp.firebaseapp.com",
  projectId: "prepwise-mvp",
  storageBucket: "prepwise-mvp.firebasestorage.app",
  messagingSenderId: "922169048076",
  appId: "1:922169048076:web:9492530c77eaf525f3c229"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;