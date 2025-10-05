// lib/firebase.ts
import { Platform } from "react-native";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  onAuthStateChanged, // re-export if you want
  type Auth,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// Config from .env
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FB_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_FB_AUTH_DOMAIN!,
  projectId: process.env.EXPO_PUBLIC_FB_PROJECT_ID!,
  storageBucket: process.env.EXPO_PUBLIC_FB_STORAGE_BUCKET!,
  appId: process.env.EXPO_PUBLIC_FB_APP_ID!,
  messagingSenderId: process.env.EXPO_PUBLIC_FB_MESSAGING_SENDER_ID!,
};

// Ensure single app instance
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// IMPORTANT: Auth init differs between web and native
let _auth: Auth;
if (Platform.OS === "web") {
  _auth = getAuth(app); // web can use default
} else {
  // React Native must initialize with persistence explicitly
  _auth =
    // if already initialized (fast refresh), reuse it
    (getAuth(app) as Auth | undefined) ??
    initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
}

export const auth = _auth;
export const db = getFirestore(app);

// (Optional) pass-through export so your hook can import from here
export { onAuthStateChanged };
