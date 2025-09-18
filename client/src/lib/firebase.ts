import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDs-6xXv7JCdfa2Ym054_myxlVPW_3dj7A",
  authDomain: "match-point-0918.firebaseapp.com",
  projectId: "match-point-0918",
  storageBucket: "match-point-0918.firebasestorage.app",
  messagingSenderId: "954722611216",
  appId: "1:954722611216:web:c17068d5a4af6d3fd91a95"
};

console.log('Firebase Config loaded successfully');

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
