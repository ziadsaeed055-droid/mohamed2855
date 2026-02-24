"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { collection, addDoc, deleteDoc, doc, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import type { Product } from "@/lib/types"

interface WishlistContextType {
  wishlistItems: (Product & { wishlistId: string })[]
  addToWishlist: (product: Product) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  loading: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [wishlistItems, setWishlistItems] = useState<(Product & { wishlistId: string })[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      setWishlistItems([])
      return
    }

    const fetchWishlist = async () => {
      setLoading(true)
      try {
        const q = query(collection(db, "wishlist"), where("userId", "==", user.id))
        const snapshot = await getDocs(q)

        const items = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const wishlistDoc = doc.data()
            const productRef = await getDocs(
              query(collection(db, "products"), where("id", "==", wishlistDoc.productId)),
            )

            if (!productRef.empty) {
              const productData = productRef.docs[0].data()
              return {
                wishlistId: doc.id,
                id: productRef.docs[0].id,
                ...productData,
              } as Product & { wishlistId: string }
            }
            return null
          }),
        )

        setWishlistItems(items.filter(Boolean))
      } catch (error) {
        console.error("[v0] Error fetching wishlist:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWishlist()
  }, [user])

  const addToWishlist = async (product: Product) => {
    if (!user) throw new Error("User must be logged in")

    try {
      const docRef = await addDoc(collection(db, "wishlist"), {
        userId: user.id,
        productId: product.id,
        createdAt: new Date(),
      })

      setWishlistItems([
        ...wishlistItems,
        {
          ...product,
          wishlistId: docRef.id,
        },
      ])
    } catch (error) {
      console.error("[v0] Error adding to wishlist:", error)
      throw error
    }
  }

  const removeFromWishlist = async (productId: string) => {
    const item = wishlistItems.find((item) => item.id === productId)
    if (!item) throw new Error("Item not found in wishlist")

    try {
      await deleteDoc(doc(db, "wishlist", item.wishlistId))
      setWishlistItems(wishlistItems.filter((item) => item.id !== productId))
    } catch (error) {
      console.error("[v0] Error removing from wishlist:", error)
      throw error
    }
  }

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((item) => item.id === productId)
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
