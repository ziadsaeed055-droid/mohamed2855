import type { MetadataRoute } from "next"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Product } from "@/lib/types"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://sevenblue.store"

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/shop?category=men`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/shop?category=women`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/shop?category=kids`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/shop?category=youth`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/shop?featured=true`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ]

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = []

  try {
    const productsSnapshot = await getDocs(collection(db, "products"))
    productPages = productsSnapshot.docs
      .filter((doc) => {
        const data = doc.data() as Product
        return data.isActive
      })
      .map((doc) => {
        const product = doc.data() as Product
        let lastModified: Date
        
        try {
          if (product.updatedAt) {
            const dateValue = product.updatedAt instanceof Date ? product.updatedAt : new Date(product.updatedAt)
            lastModified = isNaN(dateValue.getTime()) ? new Date() : dateValue
          } else {
            lastModified = new Date()
          }
        } catch (e) {
          lastModified = new Date()
        }
        
        return {
          url: `${baseUrl}/product/${doc.id}`,
          lastModified,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }
      })
  } catch (error) {
    console.error("[v0] Error fetching products for sitemap:", error)
  }

  return [...staticPages, ...productPages]
}
