import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'pending' | 'inactive';
  subscriptionDueDate?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isOwner: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isOwner: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const email = firebaseUser.email || '';
        const isOwnerAccount = email.toLowerCase() === 'lfquadrosdecorativos@gmail.com';

        // Fast fallback profile so app never freezes in null state
        const defaultProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: email,
          role: isOwnerAccount ? 'admin' : 'user',
          status: isOwnerAccount ? 'active' : 'pending',
          subscriptionDueDate: isOwnerAccount ? undefined : new Date(Date.now() + 7 * 86400000).toISOString(),
          createdAt: new Date().toISOString(),
        };

        const docRef = doc(db, 'users', firebaseUser.uid);
        unsubscribeProfile = onSnapshot(docRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            if (isOwnerAccount && (data.role !== 'admin' || data.status !== 'active')) {
              setProfile({ ...data, role: 'admin', status: 'active' });
            } else {
              setProfile(data);
            }
          } else {
            // Profile document does not exist yet; try creating it or set default in memory
            try {
              const { setDoc } = await import('firebase/firestore');
              await setDoc(docRef, defaultProfile, { merge: true });
            } catch (err) {
              console.warn("Could not write default profile to Firestore, using fallback in state:", err);
            }
            setProfile(defaultProfile);
          }
          setLoading(false);
        }, (error) => {
          console.warn("Snapshot error fetching profile:", error);
          setProfile(defaultProfile);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
        if (unsubscribeProfile) unsubscribeProfile();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const isOwner = !!(user?.email && user.email.toLowerCase() === 'lfquadrosdecorativos@gmail.com');
  const isAdmin = isOwner || profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isOwner }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
