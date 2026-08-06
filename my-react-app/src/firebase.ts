import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB49phhxtJZEiYlN0IynUIjBInZompESh0",
  authDomain: "task1-e43ad.firebaseapp.com",
  projectId: "task1-e43ad",
  storageBucket: "task1-e43ad.firebasestorage.app",
  messagingSenderId: "152364118368",
  appId: "1:152364118368:web:c3acba99e9d681648b6e05",
  measurementId: "G-6C5WEPJZRP"
};

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
