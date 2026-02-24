"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, googleProvider, db } from "@/lib/firebase"
import type { User } from "@/lib/types"
import { sendWelcomeNotification, sendLoginNotification } from "@/lib/notification-service"
import { initializeLoyaltyData, processReferral } from "@/lib/loyalty-service"
import { generateReferralCode } from "@/lib/loyalty-types"

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  signInWithGoogle: (referralCode?: string) => Promise<boolean>
  signInWithEmail: (email: string, password: string, profileData?: Partial<User>) => Promise<void>
  signOut: () => Promise<void>
  updateUserProfile: (data: Partial<User>) => Promise<void>
  needsProfileCompletion: boolean
  setNeedsProfileCompletion: (value: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", fbUser.uid))
          if (userDoc.exists()) {
            setUser({ id: fbUser.uid, ...userDoc.data() } as User)
            setNeedsProfileCompletion(false)
          } else {
            await setDoc(doc(db, "users", fbUser.uid), {
              id: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName || "",
              photoURL: fbUser.photoURL || "",
              role: "user",
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            setUser({
              id: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName || "",
              photoURL: fbUser.photoURL || "",
              role: "user",
            } as User)
            setNeedsProfileCompletion(false)
          }
        } catch (error) {
          console.error("[v0] Error fetching user doc:", error)
          setNeedsProfileCompletion(true)
        }
      } else {
        setUser(null)
        setNeedsProfileCompletion(false)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async (referralCode?: string): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const userDoc = await getDoc(doc(db, "users", result.user.uid))

      if (!userDoc.exists()) {
        const userReferralCode = generateReferralCode(result.user.uid)
        console.log("[v0] Generated referral code for Google user:", userReferralCode)
        
        await setDoc(doc(db, "users", result.user.uid), {
          id: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || "",
          photoURL: result.user.photoURL || "",
          role: "user",
          usedReferralCode: referralCode || null,
          referralCode: userReferralCode, // Save user's own referral code immediately
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        try {
          await sendWelcomeNotification(result.user.uid, result.user.displayName || "User")
          console.log("[v0] Welcome notification sent for Google user")
        } catch (notificationError) {
          console.error("[v0] Failed to send welcome notification:", notificationError)
        }

        // Initialize loyalty system for new user
        try {
          await initializeLoyaltyData(result.user.uid)
          console.log("[v0] Loyalty data initialized for Google user")

          // Process referral if code provided
          if (referralCode) {
            await processReferral(
              result.user.uid,
              result.user.displayName || "User",
              result.user.email || "",
              referralCode,
            )
            console.log("[v0] Referral processed for Google user")
          }
        } catch (loyaltyError) {
          console.error("[v0] Failed to initialize loyalty:", loyaltyError)
        }

        setNeedsProfileCompletion(true)
        return true
      } else {
        try {
          await sendLoginNotification(result.user.uid, result.user.displayName || "User")
          console.log("[v0] Login notification sent for returning Google user")
        } catch (notificationError) {
          console.error("[v0] Failed to send login notification:", notificationError)
        }
      }
      return false
    } catch (error) {
      console.error("[v0] Google sign in error:", error)
      throw error
    }
  }

  const signInWithEmail = async (email: string, password: string, profileData?: Partial<User>): Promise<void> => {
    try {
      let userCredential

      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password)

        try {
          await sendLoginNotification(userCredential.user.uid, profileData?.displayName || "User")
          console.log("[v0] Login notification sent for returning email user")
        } catch (notificationError) {
          console.error("[v0] Failed to send login notification:", notificationError)
        }
      } catch (signInError: any) {
        if (signInError.code === "auth/user-not-found" || signInError.code === "auth/invalid-credential") {
          userCredential = await createUserWithEmailAndPassword(auth, email, password)

          const referralCode = profileData?.referralCode || null
          const userReferralCode = generateReferralCode(userCredential.user.uid)

          console.log("[v0] ==================== NEW USER SIGNUP ====================")
          console.log("[v0] 👤 User ID:", userCredential.user.uid)
          console.log("[v0] 📧 Email:", userCredential.user.email)
          console.log("[v0] 👔 Display Name:", profileData?.displayName)
          console.log("[v0] 🔗 Referral Code (from URL):", referralCode || "NONE")
          console.log("[v0] 🔗 Generated Own Referral Code:", userReferralCode)
          console.log("[v0] ==========================================================")


          const userData: Partial<User> = {
            id: userCredential.user.uid,
            email: userCredential.user.email || "",
            displayName: profileData?.displayName || "",
            photoURL: profileData?.photoURL || "",
            role: "user",
            phone: profileData?.phone || "",
            city: profileData?.city || "",
            usedReferralCode: referralCode,
            referralCode: userReferralCode, // Save user's own referral code immediately
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          await setDoc(doc(db, "users", userCredential.user.uid), userData)

          try {
            await sendWelcomeNotification(userCredential.user.uid, profileData?.displayName || "User")
            console.log("[v0] Welcome notification sent for email user")
          } catch (notificationError) {
            console.error("[v0] Failed to send welcome notification:", notificationError)
          }

          // Initialize loyalty system for new user
          try {
            await initializeLoyaltyData(userCredential.user.uid)
            console.log("[v0] Loyalty data initialized for email user")

            // Process referral if code provided
            if (referralCode) {
              console.log("[v0] ==================== PROCESSING REFERRAL ====================")
              console.log("[v0] 🎁 New User ID:", userCredential.user.uid)
              console.log("[v0] 🎁 New User Name:", profileData?.displayName || "User")
              console.log("[v0] 🎁 New User Email:", email)
              console.log("[v0] 🎁 Referral Code:", referralCode)
              console.log("[v0] ===============================================================")

              const referralProcessed = await processReferral(
                userCredential.user.uid,
                profileData?.displayName || "User",
                email,
                referralCode,
              )

              if (referralProcessed) {
                console.log("[v0] ✅✅✅ Referral processed successfully for email user")
              } else {
                console.error("[v0] ❌❌❌ Referral processing FAILED")
              }
            } else {
              console.log("[v0] ⚠️ No referral code provided - skipping referral processing")
            }
          } catch (loyaltyError) {
            console.error("[v0] Failed to initialize loyalty:", loyaltyError)
          }

          setUser(userData as User)
        } else {
          throw signInError
        }
      }
    } catch (error) {
      console.error("[v0] Email sign in error:", error)
      throw error
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
    } catch (error) {
      console.error("[v0] Sign out error:", error)
      throw error
    }
  }

  const updateUserProfile = async (data: Partial<User>): Promise<void> => {
    if (!firebaseUser) throw new Error("No user logged in")

    try {
      await setDoc(
        doc(db, "users", firebaseUser.uid),
        {
          ...data,
          updatedAt: new Date(),
        },
        { merge: true },
      )
      setUser((prev) => (prev ? { ...prev, ...data } : null))
    } catch (error) {
      console.error("[v0] Update profile error:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signOut,
        updateUserProfile,
        needsProfileCompletion,
        setNeedsProfileCompletion,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
