// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration using Vite's environment variables
// IMPORTANT: Make sure your .env file has the correct VITE_ prefixes
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if the environment variables are loaded correctly
if (!firebaseConfig.apiKey) {
    throw new Error("Firebase API Key is missing. Please check your .env file.");
}

console.log('Firebase Config loaded successfully');

// Debug information for development only
if (import.meta.env.DEV) {
  console.log('Current domain:', window.location.origin);
  console.log('Firebase authDomain:', firebaseConfig.authDomain);
}


// Initialize Firebase
// Firebase가 이미 초기화되었는지 확인
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Export the services for use in other parts of the app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app); // realtimeDb -> rtdb
export const googleProvider = new GoogleAuthProvider();