import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "firebase/auth";
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, getRedirectResult } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { User as AppUser } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateAppUser: (userData: Partial<AppUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const signInWithGoogle = async () => {
    try {
      // Try popup first (works better in published environments)
      try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log("Google popup sign-in successful:", result.user);
        return;
      } catch (popupError: any) {
        console.warn("Popup sign-in failed, trying redirect:", popupError);
        
        // If popup fails (e.g., popup blocked, unsupported environment), fall back to redirect
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.code === 'auth/operation-not-supported-in-this-environment') {
          await signInWithRedirect(auth, googleProvider);
          return;
        }
        throw popupError;
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      
      // Add more specific error handling
      if (error.code === 'auth/unauthorized-domain') {
        console.error("Domain not authorized. Please add the domain to Firebase Console.");
        console.error("Current domain:", window.location.origin);
      }
      
      // Re-throw error so UI can handle it
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setAppUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateAppUser = async (userData: Partial<AppUser>) => {
    if (!user) return;
    
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, userData, { merge: true });
      setAppUser(prev => prev ? { ...prev, ...userData } as AppUser : userData as AppUser);
    } catch (error) {
      console.error("Update user error:", error);
      throw error; // Re-throw so calling code can handle it
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Check for redirect result first
          const result = await getRedirectResult(auth);
          if (result?.user) {
            console.log("Google sign-in successful:", result.user);
          }

          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setAppUser(userDoc.data() as AppUser);
          } else {
            setAppUser(null); // User needs to complete profile setup
          }
        } catch (error) {
          console.error("Auth state change error:", error);
          setAppUser(null);
        }
      } else {
        setAppUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    appUser,
    loading,
    signInWithGoogle,
    logout,
    updateAppUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
