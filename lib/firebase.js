import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Anahtarlar artık doğrudan koda yazıldı.
const firebaseConfig = {
  apiKey: "AIzaSyAf5r8upCpf6Ipx3hsBSaro2gV3UsAFymw",
  authDomain: "bulut-rss-projesi.firebaseapp.com",
  projectId: "bulut-rss-projesi",
  storageBucket: "bulut-rss-projesi.firebasestorage.app",
  messagingSenderId: "985608807659",
  appId: "1:985608807659:web:501316fbf57466ca38caae"
};

// Test için eklediğimiz console.log satırını artık silebiliriz.

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
