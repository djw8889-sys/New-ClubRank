// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration using Vite's environment variables
// IMPORTANT: Make sure your .env file has the correct VITE_ prefixes
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDs-6xXv7JCdfa2Ym054_myxlVPW_3dj7A",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "match-point-0918.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "match-point-0918",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "match-point-0918.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "954722611216",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:954722611216:web:c17068d5a4af6d3fd91a95"
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
const app = initializeApp(firebaseConfig);

// Export the services for use in other parts of the app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
