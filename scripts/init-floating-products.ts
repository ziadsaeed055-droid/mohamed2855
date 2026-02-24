// This script initializes the floating products settings in Firebase
// Run this once to create the initial document

import { initializeApp } from "firebase/app"
import { getFirestore, doc, setDoc } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function initializeFloatingProducts() {
  try {
    console.log("Initializing floating products...")
    
    // Create or update the floating_products settings document
    await setDoc(doc(db, "settings", "floating_products"), {
      productIds: [], // Empty array - admin will fill this
      updatedAt: new Date(),
      description: "IDs of products to display in the floating products showcase",
    })

    console.log("✅ Floating products settings initialized successfully")
  } catch (error) {
    console.error("❌ Error initializing floating products:", error)
  }
}

initializeFloatingProducts()
