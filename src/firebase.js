import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCdeGHy2veycbFP_bdK9yaV7s6CeqcS4O4",
  authDomain: "samia-site.firebaseapp.com",
  projectId: "samia-site",
  storageBucket: "samia-site.firebasestorage.app",
  messagingSenderId: "820218742620",
  appId: "1:820218742620:web:3edd631a0d7c4f861d6399"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);