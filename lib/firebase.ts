import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyBtiVo48ggqrVC-1o3olnKXBgvEc5yFzQI",
  authDomain: "seven-blue-6278c.firebaseapp.com",
  projectId: "seven-blue-6278c",
  storageBucket: "seven-blue-6278c.firebasestorage.app",
  messagingSenderId: "692914821080",
  appId: "1:692914821080:web:902d6062248836a8bec4ad",
  measurementId: "G-KZSK464BRC",
}

// Initialize Firebase only if it hasn't been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()
const storage = getStorage(app)

export { app, db, auth, googleProvider, storage }
