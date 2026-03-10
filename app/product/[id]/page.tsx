import { ProductContent } from "@/components/product-content"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Metadata } from "next"
import type { Product } from "@/lib/types"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

// Generate dynamic metadata for Open Graph sharing
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params

  try {
    const docRef = doc(db, "products", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const product = docSnap.data() as Product
      const title = product.nameAr || product.nameEn || "منتج"
      const description = product.descriptionAr || product.descriptionEn || "تسوق الآن من متجرنا"
      const price = product.discount > 0 ? product.discountedPrice : product.salePrice
      const priceText = `${price.toFixed(2)} ج.م`

      return {
        title: `${title} | Seven Blue`,
        description: `${description} - السعر: ${priceText}`,
        keywords: [
          title,
          product.nameEn,
          product.category,
          product.subCategory,
          "متجر ملابس",
          "شراء أون لاين",
          ...product.colors,
          ...product.sizes,
        ].filter(Boolean),
        openGraph: {
          title: title,
          description: `${description} - السعر: ${priceText}`,
          images: product.mainImage
            ? [
                {
                  url: product.mainImage,
                  width: 800,
                  height: 800,
                  alt: title,
                },
              ]
            : [],
          type: "article",
          url: `https://sevenblue.store/product/${id}`,
        },
        twitter: {
          card: "summary_large_image",
          title: title,
          description: `${description} - السعر: ${priceText}`,
          images: product.mainImage ? [product.mainImage] : [],
          creator: "@SevenBlue",
        },
      }
    }
  } catch (error) {
    console.error("[v0] Error generating metadata:", error)
  }

  return {
    title: "المنتج | Seven Blue",
    description: "تسوق الآن من متجرنا",
  }
}

interface ProductPageContentProps {
  product: Product
  productId: string
}

function ProductPageStructuredData({ product, productId }: ProductPageContentProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `https://sevenblue.store/product/${productId}`,
    name: product.nameEn || product.nameAr,
    description: product.descriptionEn || product.descriptionAr,
    image: product.mainImage,
    brand: {
      "@type": "Brand",
      name: "Seven Blue",
    },
    sku: productId,
    mpn: productId,
    color: product.colors || [],
    size: product.sizes || [],
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EGP",
      lowPrice: String(product.discount > 0 ? product.discountedPrice : product.salePrice),
      highPrice: String(product.salePrice),
      offerCount: "1",
      offers: [
        {
          "@type": "Offer",
          url: `https://sevenblue.store/product/${productId}`,
          priceCurrency: "EGP",
          price: String(product.discount > 0 ? product.discountedPrice : product.salePrice),
          priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          availability: product.quantity > 0 ? "InStock" : "OutOfStock",
          seller: {
            "@type": "Organization",
            name: "Seven Blue",
          },
        },
      ],
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  )
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params

  // Fetch product for structured data
  let product: Product | null = null
  try {
    const docRef = doc(db, "products", id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      product = docSnap.data() as Product
    }
  } catch (error) {
    console.error("[v0] Error fetching product:", error)
  }

  return (
    <>
      {product && <ProductPageStructuredData product={product} productId={id} />}
      <ProductContent productId={id} />
    </>
  )
}
