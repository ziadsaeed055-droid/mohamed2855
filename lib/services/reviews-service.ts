import { db } from "@/lib/firebase"
import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, Timestamp, orderBy } from "firebase/firestore"
import type { Review, ProductRating } from "@/lib/types"

const REVIEWS_COLLECTION = "reviews"
const RATINGS_COLLECTION = "product_ratings"

export const reviewsService = {
  // Add a new review
  async addReview(review: Omit<Review, "id" | "createdAt" | "updatedAt">): Promise<string> {
    try {
      const reviewId = doc(collection(db, REVIEWS_COLLECTION)).id
      const reviewData = {
        ...review,
        id: reviewId,
        helpful: 0,
        unhelpful: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      await setDoc(doc(db, REVIEWS_COLLECTION, reviewId), reviewData)

      // Update product rating
      await this.updateProductRating(review.productId)

      return reviewId
    } catch (error) {
      console.error("[Reviews Service] Error adding review:", error)
      throw error
    }
  },

  // Get all reviews for a product
  async getProductReviews(productId: string): Promise<Review[]> {
    try {
      const q = query(
        collection(db, REVIEWS_COLLECTION),
        where("productId", "==", productId),
        orderBy("createdAt", "desc")
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => doc.data() as Review)
    } catch (error) {
      console.error("[Reviews Service] Error fetching product reviews:", error)
      return []
    }
  },

  // Get product rating summary
  async getProductRating(productId: string): Promise<ProductRating | null> {
    try {
      const ratingDoc = await getDoc(doc(db, RATINGS_COLLECTION, productId))
      return ratingDoc.exists() ? (ratingDoc.data() as ProductRating) : null
    } catch (error) {
      console.error("[Reviews Service] Error fetching product rating:", error)
      return null
    }
  },

  // Update product rating (called after adding a review)
  async updateProductRating(productId: string): Promise<void> {
    try {
      const reviews = await this.getProductReviews(productId)

      if (reviews.length === 0) {
        await setDoc(doc(db, RATINGS_COLLECTION, productId), {
          productId,
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          recentReviews: [],
        })
        return
      }

      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      let totalRating = 0

      reviews.forEach(review => {
        totalRating += review.rating
        ratingDistribution[review.rating as keyof typeof ratingDistribution]++
      })

      const averageRating = totalRating / reviews.length

      await setDoc(doc(db, RATINGS_COLLECTION, productId), {
        productId,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length,
        ratingDistribution,
        recentReviews: reviews.slice(0, 5),
      })
    } catch (error) {
      console.error("[Reviews Service] Error updating product rating:", error)
    }
  },

  // Mark review as helpful
  async markHelpful(reviewId: string): Promise<void> {
    try {
      const reviewDoc = await getDoc(doc(db, REVIEWS_COLLECTION, reviewId))
      if (reviewDoc.exists()) {
        await updateDoc(doc(db, REVIEWS_COLLECTION, reviewId), {
          helpful: (reviewDoc.data().helpful || 0) + 1,
        })
      }
    } catch (error) {
      console.error("[Reviews Service] Error marking helpful:", error)
    }
  },

  // Mark review as unhelpful
  async markUnhelpful(reviewId: string): Promise<void> {
    try {
      const reviewDoc = await getDoc(doc(db, REVIEWS_COLLECTION, reviewId))
      if (reviewDoc.exists()) {
        await updateDoc(doc(db, REVIEWS_COLLECTION, reviewId), {
          unhelpful: (reviewDoc.data().unhelpful || 0) + 1,
        })
      }
    } catch (error) {
      console.error("[Reviews Service] Error marking unhelpful:", error)
    }
  },

  // Add admin response to review
  async addResponse(reviewId: string, response: string): Promise<void> {
    try {
      await updateDoc(doc(db, REVIEWS_COLLECTION, reviewId), {
        response: {
          text: response,
          timestamp: Timestamp.now(),
        },
      })
    } catch (error) {
      console.error("[Reviews Service] Error adding response:", error)
    }
  },

  // Get verified reviews (from customers who purchased)
  async getVerifiedReviews(productId: string): Promise<Review[]> {
    try {
      const reviews = await this.getProductReviews(productId)
      return reviews.filter(review => review.verified)
    } catch (error) {
      console.error("[Reviews Service] Error fetching verified reviews:", error)
      return []
    }
  },
}
