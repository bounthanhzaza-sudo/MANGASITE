import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCljjWwgxjJRWAXPCeFzLipi6FuAjfRIag",
  authDomain: "apiauthentication-47d8f.firebaseapp.com",
  projectId: "apiauthentication-47d8f",
  storageBucket: "apiauthentication-47d8f.firebasestorage.app",
  messagingSenderId: "709756890113",
  appId: "1:709756890113:web:8f2d9d53878cbc33802400"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();