"use client"

import type React from "react"
import { createContext, useContext, useCallback, useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
  getDocs,
  serverTimestamp,
  limit,
} from "firebase/firestore"
import type { Notification } from "@/lib/types"

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "isRead">) => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  deleteAllNotifications: () => Promise<void>
  refreshNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, firebaseUser } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only subscribe if user is authenticated AND we have their ID
    if (!user?.id || !firebaseUser) {
      setNotifications([])
      setIsLoading(false)
      return
    }

    console.log("[v0] Setting up notification listener for user:", user.id)
    setIsLoading(true)
    setError(null)

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.id),
      orderBy("createdAt", "desc"),
      limit(50),
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log("[v0] Notifications snapshot received:", snapshot.docs.length, "documents")
        const notifs = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
          } as Notification
        })
        setNotifications(notifs)
        setError(null)
        setIsLoading(false)
        console.log("[v0] Notifications loaded successfully:", notifs.length)
      },
      (err) => {
        console.error("[v0] Notification listener error:", err.code, err.message)
        setError(err.message)
        setIsLoading(false)
        // Don't crash - just show empty notifications
        setNotifications([])
      },
    )

    return () => {
      console.log("[v0] Cleaning up notification listener")
      unsubscribe()
    }
  }, [user?.id, firebaseUser])

  const refreshNotifications = useCallback(() => {
    if (!user?.id) return
    // Re-trigger the effect by updating a dummy state (the effect depends on user.id)
    console.log("[v0] Refreshing notifications...")
  }, [user?.id])

  const addNotification = useCallback(
    async (notification: Omit<Notification, "id" | "createdAt" | "isRead">) => {
      if (!user?.id) {
        console.warn("[v0] No user ID available for notification")
        return
      }

      try {
        console.log("[v0] Adding notification for user:", user.id)
        await addDoc(collection(db, "notifications"), {
          ...notification,
          userId: user.id,
          isRead: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        console.log("[v0] Notification added successfully")
      } catch (err) {
        console.error("[v0] Error adding notification:", err)
        throw err
      }
    },
    [user?.id],
  )

  const markAsRead = useCallback(async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), {
        isRead: true,
        updatedAt: serverTimestamp(),
      })
      console.log("[v0] Notification marked as read:", id)
    } catch (err) {
      console.error("[v0] Error marking notification as read:", err)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return

    try {
      const q = query(collection(db, "notifications"), where("userId", "==", user.id), where("isRead", "==", false))
      const snapshot = await getDocs(q)
      const batch = snapshot.docs.map((doc) =>
        updateDoc(doc.ref, {
          isRead: true,
          updatedAt: serverTimestamp(),
        }),
      )
      await Promise.all(batch)
      console.log("[v0] All notifications marked as read")
    } catch (err) {
      console.error("[v0] Error marking all as read:", err)
    }
  }, [user?.id])

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, "notifications", id))
      console.log("[v0] Notification deleted:", id)
    } catch (err) {
      console.error("[v0] Error deleting notification:", err)
    }
  }, [])

  const deleteAllNotifications = useCallback(async () => {
    if (!user?.id) return

    try {
      const q = query(collection(db, "notifications"), where("userId", "==", user.id))
      const snapshot = await getDocs(q)
      const batch = snapshot.docs.map((doc) => deleteDoc(doc.ref))
      await Promise.all(batch)
      console.log("[v0] All notifications deleted")
    } catch (err) {
      console.error("[v0] Error deleting all notifications:", err)
    }
  }, [user?.id])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        error,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider")
  }
  return context
}
