import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAZ7xcoQCqlj6M_Sd-kAlq17HiaC2mRINo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "vctor-e91b9.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vctor-e91b9",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "vctor-e91b9.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "768512855029",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:768512855029:web:62384e4420119b53bfeebc",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-9D3C7Z700P",
};

// Check if config exists
export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.authDomain
);

let app;
if (isFirebaseConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} else {
  console.warn(
    'Firebase environment variables are missing. Please populate VITE_FIREBASE_* in your .env or .env.local file.'
  );
}

export const auth = isFirebaseConfigured ? getAuth(app!) : (null as any);
export const db = isFirebaseConfigured ? getFirestore(app!) : (null as any);
export const cloudDbName = firebaseConfig.projectId;
