import { getFirestore } from "firebase/firestore";
import { initializeApp, getApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBmG0dUX40_4dL50ldiwK_cQ6jxHzaixn0",
  authDomain: "todo-app-rn-ee619.firebaseapp.com",
  projectId: "todo-app-rn-ee619",
  storageBucket: "todo-app-rn-ee619.appspot.com",
  messagingSenderId: "427660456636",
  appId: "1:427660456636:web:55e40e036e97115722d6b9",
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);

//adding to gitignore
