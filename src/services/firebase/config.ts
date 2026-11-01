import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';

// Strict requirement: NEVER import or use getStorage or firebase/storage!

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const isTestEnv =
  typeof process !== 'undefined' &&
  (process.env.NODE_ENV === 'test' || Boolean(process.env.VITEST));

export const isFirebaseConfigured = Boolean(
  !isTestEnv &&
  firebaseConfig.apiKey &&
  firebaseConfig.databaseURL &&
  firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let database: Database | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    database = getDatabase(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  console.warn(
    'Firebase environment variables missing. Operating in offline/demo mode with local state synchronization.'
  );
}

export { app, auth, database };

