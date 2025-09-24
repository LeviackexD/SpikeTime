
'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot as onFirestoreSnapshot } from 'firebase/firestore';
import { ref as dbRef, onValue as onRealtimeDBValue } from 'firebase/database';
import { auth, db, rtdb } from '@/lib/firebase';
import type { User, SkillLevel, PlayerPosition } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type AuthUser = User | null;

interface AuthContextType {
  user: AuthUser;
  loading: boolean;
  logout: () => void;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  signUpWithEmail: (email: string, pass: string, additionalData: { name: string, skillLevel: SkillLevel, favoritePosition: PlayerPosition }) => Promise<boolean>;
  updateUser: (updatedData: Partial<User>) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/register'];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<AuthUser>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  React.useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const adminRef = dbRef(rtdb, `adminConfig/adminUserUids/${firebaseUser.uid}`);

            const unsubFirestore = onFirestoreSnapshot(userDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    const userProfileData = docSnap.data() as Omit<User, 'id' | 'role'>;
                    const unsubRTDB = onRealtimeDBValue(adminRef, (snapshot) => {
                        const isAdmin = snapshot.val() === true;
                        setUser({ 
                            id: firebaseUser.uid,
                            ...userProfileData,
                            role: isAdmin ? 'admin' : 'user'
                        } as User);
                        setLoading(false);
                    });
                    // This cleanup for RTDB is important, but we only want to do it once when the auth state changes
                    // not every time the user doc updates. We manage it inside the main cleanup function.
                } else {
                    // Document doesn't exist, which can happen briefly during signup.
                    // We don't set loading to false here, just wait.
                }
            });

            return () => {
                unsubFirestore();
                // We don't have a direct reference to unsubRTDB here, but it's okay because
                // the main auth subscription's cleanup will handle everything.
            };
        } else {
            // No user is signed in
            setUser(null);
            setLoading(false);
        }
    });

    return () => unsubscribeAuth();
  }, []);


  React.useEffect(() => {
    if (loading) return; // Don't do anything while loading
    
    const isAuthRoute = publicRoutes.includes(pathname);

    // If user is logged in and tries to access login/register, redirect to home
    if (user && isAuthRoute) {
      router.push('/');
    }
    
    // If user is not logged in and not on a public route, redirect to login
    if (!user && !isAuthRoute) {
      router.push('/login');
    }

  }, [user, loading, router, pathname]);

  const handleAuthError = (error: any, defaultMessage: string) => {
       const errorCode = error.code || 'unknown';
       let description = defaultMessage;
       if(errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
           description = 'Invalid email or password.';
       } else if (errorCode === 'auth/email-already-in-use') {
           description = 'This email address is already in use.';
       }
       toast({
        title: 'Authentication Failed',
        description: description,
        variant: 'destructive',
      });
  }

  const logout = async () => {
    try {
        await signOut(auth);
        toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
        router.push('/login');
    } catch (error) {
        console.error('Error signing out: ', error);
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        return true;
    } catch (error: any) {
        handleAuthError(error, 'Could not sign you in.');
        return false;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, additionalData: { name: string, skillLevel: SkillLevel, favoritePosition: PlayerPosition }): Promise<boolean> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const firebaseUser = userCredential.user;

        const newUser: Omit<User, 'id' | 'role'> = {
            name: additionalData.name,
            email: email,
            username: email.split('@')[0],
            avatarUrl: `https://picsum.photos/seed/${firebaseUser.uid}/100/100`,
            skillLevel: additionalData.skillLevel,
            favoritePosition: additionalData.favoritePosition,
            stats: {
                sessionsPlayed: 0,
                attendanceRate: 100,
            },
        };
        
        await setDoc(doc(db, "users", firebaseUser.uid), newUser);
        return true;

    } catch (error: any) {
        handleAuthError(error, 'Could not create your account.');
        return false;
    }
  };

  const updateUser = async (updatedData: Partial<User>) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.id);
    try {
        await setDoc(userDocRef, updatedData, { merge: true });
        toast({
            title: "Profile Updated",
            description: "Your profile information has been saved.",
            variant: "success"
        });
    } catch (error) {
        console.error("Error updating user profile:", error);
        toast({
            title: "Update Failed",
            description: "Could not save your profile changes.",
            variant: "destructive"
        });
    }
  }
  
  if (loading && !publicRoutes.includes(pathname)) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
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
