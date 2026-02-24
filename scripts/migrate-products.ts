import { collection, getDocs, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

async function migrateProducts() {
  try {
    console.log("[v0] Starting product migration...")

    const productsRef = collection(db, "products")
    const snapshot = await getDocs(productsRef)

    let updated = 0

    for (const docSnap of snapshot.docs) {
      const productData = docSnap.data()
      const updates: any = {}

      // Add missing fields with default values
      if (!("isFeatured" in productData)) updates.isFeatured = false
      if (!("discount" in productData)) updates.discount = 0
      if (!("discountedPrice" in productData)) updates.discountedPrice = productData.salePrice || 0
      if (!("colors" in productData)) updates.colors = []
      if (!("sizes" in productData)) updates.sizes = []
      if (!("alertQuantity" in productData)) updates.alertQuantity = 5

      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, "products", docSnap.id), updates)
        updated++
        console.log(`[v0] Updated product: ${docSnap.id}`)
      }
    }

    console.log(`[v0] Migration complete! Updated ${updated} products`)
  } catch (error) {
    console.error("[v0] Migration error:", error)
  }
}

migrateProducts()
