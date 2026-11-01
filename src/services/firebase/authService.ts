import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, database, isFirebaseConfigured } from './config';
import { UserProfile } from '../../types/user';

const DEMO_USER_KEY = 'eventwise_demo_user';

export const AuthService = {
  async signUp(email: string, password: string, displayName: string): Promise<UserProfile> {
    if (!isFirebaseConfigured || !auth || !database) {
      const demoUser: UserProfile = {
        uid: `demo_${Date.now()}`,
        email,
        displayName,
        createdAt: Date.now(),
        preferences: { defaultCurrency: 'INR' },
      };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
      return demoUser;
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });

    const userProfile: UserProfile = {
      uid: cred.user.uid,
      email: cred.user.email || email,
      displayName,
      createdAt: Date.now(),
      preferences: { defaultCurrency: 'INR' },
    };

    // Save user profile in Realtime Database: users/{uid}
    const userRef = ref(database, `users/${cred.user.uid}/profile`);
    await set(userRef, userProfile);

    return userProfile;
  },

  async login(email: string, password: string): Promise<UserProfile> {
    if (!isFirebaseConfigured || !auth || !database) {
      const stored = localStorage.getItem(DEMO_USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      const demoUser: UserProfile = {
        uid: 'demo_user_123',
        email,
        displayName: email.split('@')[0] || 'Demo Planner',
        createdAt: Date.now(),
        preferences: { defaultCurrency: 'INR' },
      };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
      return demoUser;
    }

    const cred = await signInWithEmailAndPassword(auth, email, password);
    const profileSnap = await get(ref(database, `users/${cred.user.uid}/profile`));
    
    if (profileSnap.exists()) {
      return profileSnap.val() as UserProfile;
    }

    const fallbackProfile: UserProfile = {
      uid: cred.user.uid,
      email: cred.user.email || email,
      displayName: cred.user.displayName || 'Event Planner',
      createdAt: Date.now(),
      preferences: { defaultCurrency: 'INR' },
    };
    await set(ref(database, `users/${cred.user.uid}/profile`), fallbackProfile);
    return fallbackProfile;
  },

  async signInAsDemoUser(email = 'alex.planner@gmail.com', displayName = 'Alex Planner'): Promise<UserProfile> {
    const demoUser: UserProfile = {
      uid: 'demo_google_user',
      email,
      displayName,
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      createdAt: Date.now(),
      preferences: { defaultCurrency: 'INR' },
    };
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
    return demoUser;
  },

  async signInWithGoogle(): Promise<UserProfile> {
    if (!isFirebaseConfigured || !auth || !database) {
      return this.signInAsDemoUser();
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    const profileSnap = await get(ref(database, `users/${cred.user.uid}/profile`));

    if (profileSnap.exists()) {
      return profileSnap.val() as UserProfile;
    }

    const newProfile: UserProfile = {
      uid: cred.user.uid,
      email: cred.user.email || '',
      displayName: cred.user.displayName || cred.user.email?.split('@')[0] || 'Event Planner',
      photoURL: cred.user.photoURL || undefined,
      createdAt: Date.now(),
      preferences: { defaultCurrency: 'INR' },
    };
    await set(ref(database, `users/${cred.user.uid}/profile`), newProfile);
    return newProfile;
  },

  async resetPassword(email: string): Promise<void> {
    if (!isFirebaseConfigured || !auth) {
      console.log('Password reset requested in demo mode for:', email);
      return;
    }
    await sendPasswordResetEmail(auth, email);
  },

  async logout(): Promise<void> {
    localStorage.removeItem(DEMO_USER_KEY);
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
  },

  onAuthChanged(callback: (user: UserProfile | null) => void): () => void {
    if (!isFirebaseConfigured || !auth) {
      const stored = localStorage.getItem(DEMO_USER_KEY);
      if (stored) {
        try {
          callback(JSON.parse(stored));
        } catch {
          callback(null);
        }
      } else {
        callback(null);
      }
      return () => {};
    }

    return onAuthStateChanged(auth, async (user: User | null) => {
      if (user && database) {
        try {
          const profileSnap = await get(ref(database, `users/${user.uid}/profile`));
          if (profileSnap.exists()) {
            callback(profileSnap.val() as UserProfile);
            return;
          }
          callback({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Event Planner',
            photoURL: user.photoURL || undefined,
            createdAt: Date.now(),
          });
        } catch {
          callback({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Event Planner',
            photoURL: user.photoURL || undefined,
            createdAt: Date.now(),
          });
        }
      } else {
        callback(null);
      }
    });
  },
};

