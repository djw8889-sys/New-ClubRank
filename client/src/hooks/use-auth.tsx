import { createContext, useContext, useEffect, useState } from "react";
import { User as FirebaseUser, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { NewUser, User } from "@shared/schema";

interface AuthContextType {
  user: FirebaseUser | null;
  profile: User | null;
  signInWithGoogle: () => Promise<void>;
  updateProfile: (newProfile: Partial<User>) => Promise<void>;
  isProfileNew: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [isProfileNew, setIsProfileNew] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setProfile(userDoc.data() as User);
          setIsProfileNew(false);
        } else {
          const newProfileData: NewUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            username: firebaseUser.displayName,
            avatarUrl: firebaseUser.photoURL,
          };
          await setDoc(userDocRef, newProfileData);
          setProfile(newProfileData as User);
          setIsProfileNew(true);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  const updateProfile = async (newProfileData: Partial<User>) => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, newProfileData, { merge: true });
      setProfile((prev) => ({ ...prev!, ...newProfileData }));
      if (isProfileNew) setIsProfileNew(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, updateProfile, signInWithGoogle, isProfileNew, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};