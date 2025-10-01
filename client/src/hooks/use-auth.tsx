import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { User } from "@shared/schema";

interface AuthContextType {
  user: FirebaseUser | null;
  profile: User | null;
  loading: boolean;
  isProfileNew: boolean;
  updateProfile: (newProfileData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileNew, setIsProfileNew] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setProfile(userDoc.data() as User);
          setIsProfileNew(false);
        } else {
          const newProfile: User = {
            id: firebaseUser.uid,
            username: firebaseUser.displayName || "New User",
            email: firebaseUser.email || "",
            avatarUrl: firebaseUser.photoURL || "",
            elo: 1200,
            createdAt: new Date(),
            updatedAt: new Date(),
            bio: "",
            location: "",
            isAdmin: false,
            points: 0,
          };
          await setDoc(userDocRef, { ...newProfile, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
          setProfile(newProfile);
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

  const updateProfile = async (newProfileData: Partial<User>) => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { ...newProfileData, updatedAt: serverTimestamp() }, { merge: true });
      setProfile((prev) => (prev ? { ...prev, ...newProfileData } : null));
      if(isProfileNew) setIsProfileNew(false);
    }
  };

  const value = { user, profile, loading, isProfileNew, updateProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

