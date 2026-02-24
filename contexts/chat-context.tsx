"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react"
import { collection, getDocs, query, orderBy, where, addDoc, updateDoc, doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import type { Conversation, Message } from "@/lib/types"

interface ChatContextType {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  setCurrentConversation: (conversation: Conversation | null) => void
  fetchConversations: () => Promise<void>
  fetchMessages: (conversationId: string) => Promise<void>
  sendMessage: (conversationId: string, content: string, senderRole: "user" | "admin") => Promise<void>
  createConversation: (userName: string, userEmail: string, subject: string) => Promise<Conversation>
  isLoading: boolean
  indexError: boolean
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [indexError, setIndexError] = useState(false)
  const { user, firebaseUser } = useAuth()
  const unsubscribeRef = useRef<(() => void) | null>(null)

  const fetchConversations = useCallback(async () => {
    if (!firebaseUser) {
      console.log("[v0] User not authenticated, skipping conversation fetch")
      return
    }

    try {
      setIsLoading(true)
      const q = query(collection(db, "conversations"), orderBy("updatedAt", "desc"))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Conversation[]
      setConversations(data)
      console.log("[v0] Conversations fetched:", data.length)
    } catch (error) {
      console.error("[v0] Error fetching conversations:", error)
    } finally {
      setIsLoading(false)
    }
  }, [firebaseUser])

  const fetchMessages = useCallback(
    async (conversationId: string) => {
      if (!firebaseUser) {
        console.log("[v0] User not authenticated, skipping message fetch")
        return
      }

      try {
        setIsLoading(true)
        setIndexError(false)

        // إلغاء أي listener سابق
        if (unsubscribeRef.current) {
          unsubscribeRef.current()
        }

        const q = query(
          collection(db, "messages"),
          where("conversationId", "==", conversationId),
          orderBy("createdAt", "asc"),
        )

        unsubscribeRef.current = onSnapshot(
          q,
          (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Message[]
            setMessages(data)
            console.log("[v0] Real-time messages updated:", data.length)
          },
          (error) => {
            const errorMessage = error instanceof Error ? error.message : String(error)

            if (errorMessage.includes("requires an index")) {
              console.error("[v0] Firestore Index Required - Please create composite index")
              setIndexError(true)
            } else {
              console.error("[v0] Error fetching messages:", error)
            }

            setMessages([])
          },
        )
      } catch (error) {
        console.error("[v0] Error setting up message listener:", error)
        setMessages([])
      } finally {
        setIsLoading(false)
      }
    },
    [firebaseUser],
  )

  const sendMessage = useCallback(
    async (conversationId: string, content: string, senderRole: "user" | "admin") => {
      if (!firebaseUser) {
        throw new Error("User must be authenticated to send messages")
      }

      try {
        console.log("[v0] Sending message to conversation:", conversationId)
        console.log("[v0] Authenticated user ID:", firebaseUser.uid)

        const photoURL =
          user?.photoURL ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || "User")}&background=random`

        const messageData = {
          conversationId,
          senderId: firebaseUser.uid,
          senderName: senderRole === "admin" ? "Admin Support" : user?.displayName || "Customer",
          senderPhotoURL: photoURL,
          senderRole,
          content,
          createdAt: new Date(),
          isRead: senderRole === "admin",
        }

        console.log("[v0] Message data:", messageData)

        const docRef = await addDoc(collection(db, "messages"), messageData)

        console.log("[v0] Message added successfully with ID:", docRef.id)

        // تحديث الـ conversation
        await updateDoc(doc(db, "conversations", conversationId), {
          lastMessage: content,
          lastMessageTime: new Date(),
          unreadCount: senderRole === "user" ? 1 : 0,
          updatedAt: new Date(),
        })

        console.log("[v0] Conversation updated")

        await new Promise((resolve) => setTimeout(resolve, 200))

        // تحديث المحادثات
        await fetchConversations()

        console.log("[v0] Messages and conversations refreshed successfully")
      } catch (error) {
        console.error("[v0] Error sending message:", error)
        throw error
      }
    },
    [firebaseUser, user, fetchConversations],
  )

  const createConversation = useCallback(
    async (userName: string, userEmail: string, subject: string): Promise<Conversation> => {
      if (!firebaseUser) {
        throw new Error("User must be authenticated to create conversations")
      }

      try {
        const newConversation = {
          userId: firebaseUser.uid,
          userName: userName || "Guest",
          userEmail: userEmail || "guest@example.com",
          subject,
          lastMessage: "",
          lastMessageTime: new Date(),
          isOpen: true,
          unreadCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Omit<Conversation, "id">

        const docRef = await addDoc(collection(db, "conversations"), newConversation)

        const conversation = {
          id: docRef.id,
          ...newConversation,
        } as Conversation

        setConversations((prev) => [conversation, ...prev])
        console.log("[v0] New conversation created:", conversation.id)
        return conversation
      } catch (error) {
        console.error("[v0] Error creating conversation:", error)
        throw error
      }
    },
    [firebaseUser],
  )

  useEffect(() => {
    if (currentConversation && firebaseUser) {
      fetchMessages(currentConversation.id)
    }
  }, [currentConversation, firebaseUser, fetchMessages])

  useEffect(() => {
    if (firebaseUser) {
      fetchConversations()
    }
  }, [firebaseUser, fetchConversations])

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [])

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        setCurrentConversation,
        fetchConversations,
        fetchMessages,
        sendMessage,
        createConversation,
        isLoading,
        indexError,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("useChat must be used within ChatProvider")
  }
  return context
}
