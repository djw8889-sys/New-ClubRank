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
    console.log("Setting up Firebase Auth state listener...");
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("🔥 Firebase Auth state changed:", {
        hasUser: !!firebaseUser,
        uid: firebaseUser?.uid,
        email: firebaseUser?.email,
        displayName: firebaseUser?.displayName
      });
      
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Check for redirect result first
          const result = await getRedirectResult(auth);
          if (result?.user) {
            console.log("✅ Google redirect sign-in successful:", result.user.email);
          }

          console.log("📄 Checking Firestore user document...");
          
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            console.log("✅ Found existing user document:", userDoc.data());
            setAppUser(userDoc.data() as AppUser);
          } else {
            console.log("⚠️ No user document found - creating basic profile for new user");
            
            // 새 사용자를 위한 기본 사용자 문서 생성 (프로필 설정 필요로 표시)
            const basicUserData: AppUser = {
              id: firebaseUser.uid,
              username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "사용자",
              email: firebaseUser.email || "",
              photoURL: firebaseUser.photoURL,
              ntrp: "0.0", // 프로필 설정에서 업데이트될 예정
              region: "",
              age: "0",
              bio: null,
              availableTimes: [],
              points: 1000, // 기본 포인트
              wins: 0,
              losses: 0,
              isProfileComplete: false, // 프로필 설정 완료 여부
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            try {
              await setDoc(doc(db, "users", firebaseUser.uid), basicUserData);
              console.log("✅ Created basic user document (profile incomplete):", basicUserData);
              setAppUser(basicUserData);
            } catch (createError) {
              console.error("❌ Failed to create user document:", createError);
              setAppUser(null); // 사용자는 프로필 설정 화면으로 이동하게 됨
            }
          }
        } catch (error) {
          console.error("❌ Auth state change error:", error);
          setAppUser(null);
        }
      } else {
        console.log("🚪 User logged out");
        setAppUser(null);
      }
      
      setLoading(false);
      console.log("🏁 Auth state processing complete");
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
