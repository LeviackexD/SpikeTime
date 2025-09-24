
'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, get } from 'firebase/database';
import { auth, db, rtdb } from '@/lib/firebase';
import type { User, SkillLevel, PlayerPosition } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './language-context';
import { VolleyballIcon } from '@/components/icons/volleyball-icon';

type AuthUser = User | null;

interface AuthContextType {
  user: AuthUser;
  loading: boolean;
  logout: () => void;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  signUpWithEmail: (
    email: string,
    pass: string,
    additionalData: { name: string; skillLevel: SkillLevel; favoritePosition: PlayerPosition }
  ) => Promise<boolean>;
  updateUser: (updatedData: Partial<User>) => Promise<boolean>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<AuthUser>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { t } = useLanguage();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        console.log('AuthProvider: User is signed in with UID:', firebaseUser.uid);
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const adminRef = ref(rtdb, `adminConfig/adminUserUids/${firebaseUser.uid}`);
        
        try {
          // Promise.all to fetch from Firestore and RTDB concurrently
          const [userDocSnap, adminSnap] = await Promise.all([
            getDoc(userDocRef),
            get(adminRef)
          ]);

          if (userDocSnap.exists()) {
             const userData = userDocSnap.data() as Omit<User, 'id' | 'role'>;
             const isAdmin = adminSnap.exists() && adminSnap.val() === true;
             console.log(`AuthProvider: User role check -> isAdmin: ${isAdmin}`);
            
            const profile: User = {
              id: firebaseUser.uid,
              ...userData,
              email: firebaseUser.email || userData.email || '',
              role: isAdmin ? 'admin' : 'user',
            };
            setUser(profile);
          } else {
             console.warn("AuthProvider: User authenticated but no profile found in Firestore. Logging out.");
             await signOut(auth);
             setUser(null);
          }
        } catch (error) {
          console.error("AuthProvider: Error fetching user data:", error);
          setUser(null);
        }
      } else {
        console.log('AuthProvider: No user is signed in.');
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (!user && !isAuthPage) {
      router.push('/login');
    } else if (user && isAuthPage) {
      router.push('/');
    }
  }, [user, loading, pathname, router]);

  const logout = async () => {
    await signOut(auth);
  };

  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return true;
    } catch (error) {
      console.error("Sign in failed:", error);
      return false;
    }
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    additionalData: { name: string; skillLevel: SkillLevel; favoritePosition: PlayerPosition }
  ): Promise<boolean> => {
    console.log('Paso 1: Iniciando el proceso de registro para', email);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      console.log('Paso 2: Usuario creado en Firebase Authentication con UID:', firebaseUser.uid);

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userData = {
        name: additionalData.name,
        username: email.split('@')[0],
        avatarUrl: `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
        skillLevel: additionalData.skillLevel,
        favoritePosition: additionalData.favoritePosition,
        email: email,
        stats: { sessionsPlayed: 0, attendanceRate: 100 },
        createdAt: serverTimestamp(),
      };
      
      await setDoc(userDocRef, userData);
      console.log('Paso 3: ¡Éxito! Documento de usuario creado en Firestore.');
      
      await signOut(auth); // Sign out after registration to force user to log in
      return true;
    } catch (error) {
      console.error("ERROR en el proceso de registro:", error);
      return false;
    }
  };

  const updateUser = async (updatedData: Partial<User>): Promise<boolean> => {
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.id);
        await updateDoc(userDocRef, updatedData);
        setUser(prevUser => prevUser ? { ...prevUser, ...updatedData } : null);
        return true;
      } catch (error) {
        console.error("Failed to update user profile in Firestore:", error);
        return false;
      }
    }
    return false;
  };
  
  if (loading) {
     return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-background text-foreground">
            <VolleyballIcon className="h-12 w-12 animate-spin-slow text-primary" />
        </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, signInWithEmail, signUpWithEmail, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
