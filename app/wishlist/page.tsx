"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { collection, query, where, getDocs, doc, deleteDoc, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import type { Product } from "@/lib/types"
import { Heart, ShoppingCart, Trash2, Loader2, ArrowRight, ArrowLeft, Package, Eye } from "lucide-react"

export default function WishlistPage() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { addToCart } = useCart()
  const { t, language } = useLanguage()
  const { toast } = useToast()

  const [wishlistItems, setWishlistItems] = useState<(Product & { wishlistId: string })[]>([])
  const [loading, setLoading] = useState(true)

  const BackArrow = language === "ar" ? ArrowRight : ArrowLeft

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
      return
    }

    const fetchWishlist = async () => {
      if (!user) return
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
        toast({
          title: t("خطأ", "Error"),
          description: t("فشل في تحميل قائمة المفضلة", "Failed to load wishlist"),
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchWishlist()
  }, [user, authLoading, router, toast, t])

  const handleRemoveFromWishlist = async (wishlistId: string) => {
    try {
      await deleteDoc(doc(db, "wishlist", wishlistId))
      setWishlistItems(wishlistItems.filter((item) => item.wishlistId !== wishlistId))
      toast({
        title: t("تم الحذف", "Removed"),
        description: t("تم إزالة المنتج من المفضلة", "Product removed from wishlist"),
      })
    } catch (error) {
      console.error("[v0] Error removing from wishlist:", error)
      toast({
        title: t("خطأ", "Error"),
        description: t("فشل في إزالة المنتج", "Failed to remove product"),
        variant: "destructive",
      })
    }
  }

  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product.id,
      product,
      quantity: 1,
      selectedColor: product.colors[0] || "",
      selectedSize: product.sizes[0] || "",
    })
    toast({
      title: t("تمت الإضافة", "Added"),
      description: t("تم إضافة المنتج إلى السلة", "Product added to cart"),
    })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {t("قائمة المفضلة", "My Wishlist")}
              </h1>
              <p className="text-muted-foreground">
                {t(`لديك ${wishlistItems.length} منتج في المفضلة`, `You have ${wishlistItems.length} items`)}
              </p>
            </div>
            <Link href="/shop">
              <Button variant="outline" className="gap-2 bg-transparent">
                <BackArrow className="w-4 h-4" />
                {t("العودة للمتجر", "Back to Shop")}
              </Button>
            </Link>
          </div>

          {/* Empty State */}
          {wishlistItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border">
              <Heart className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">{t("قائمة مفضلة فارغة", "Empty Wishlist")}</h2>
              <p className="text-muted-foreground mb-6">
                {t("لم تضف أي منتجات إلى قائمة المفضلة بعد", "You haven't added any products to your wishlist yet")}
              </p>
              <Link href="/shop">
                <Button className="gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  {t("تصفح المنتجات", "Browse Products")}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Product Image */}
                  <div className="relative w-full h-64 bg-muted overflow-hidden group">
                    {item.mainImage ? (
                      <Image
                        src={item.mainImage || "/placeholder.svg"}
                        alt={language === "ar" ? item.nameAr : item.nameEn}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <Package className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                    )}

                    {/* Discount Badge */}
                    {item.discount > 0 && (
                      <Badge className="absolute top-4 right-4 bg-destructive hover:bg-destructive">
                        {t(`خصم ${item.discount}%`, `-${item.discount}%`)}
                      </Badge>
                    )}

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveFromWishlist(item.wishlistId)}
                      className="absolute top-4 left-4 bg-white/90 hover:bg-white rounded-full p-2 transition-all duration-200 shadow-md"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className="p-4 space-y-3">
                    {/* Product Name */}
                    <div>
                      <h3 className="font-semibold text-foreground line-clamp-2">
                        {language === "ar" ? item.nameAr : item.nameEn}
                      </h3>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">
                        {item.discount > 0 ? `${item.discountedPrice.toFixed(2)}` : `${item.salePrice.toFixed(2)}`}
                        {t(" ج.م", " EGP")}
                      </span>
                      {item.discount > 0 && (
                        <span className="text-sm text-muted-foreground line-through">{item.salePrice.toFixed(2)}</span>
                      )}
                    </div>

                    {/* Colors */}
                    {item.colors.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">{t("الألوان المتاحة", "Available Colors")}</p>
                        <div className="flex flex-wrap gap-2">
                          {item.colors.slice(0, 3).map((color) => (
                            <Badge key={color} variant="outline" className="text-xs">
                              {color}
                            </Badge>
                          ))}
                          {item.colors.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.colors.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stock Status */}
                    <div>
                      {item.quantity > 0 ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          {t("متوفر", "In Stock")}
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                          {t("غير متوفر", "Out of Stock")}
                        </Badge>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/product/${item.id}`} className="flex-1">
                        <Button variant="outline" className="w-full gap-2 bg-transparent">
                          <Eye className="w-4 h-4" />
                          {t("عرض", "View")}
                        </Button>
                      </Link>
                      <Button
                        className="flex-1 gap-2"
                        onClick={() => handleAddToCart(item)}
                        disabled={item.quantity === 0}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {t("شراء", "Buy")}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recommended Products Section */}
          <div className="mt-16 pt-12 border-t">
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold">{t("منتجات مقترحة", "Recommended for You")}</h2>
                </div>
                <p className="text-muted-foreground">
                  {t("اكتشف المزيد من المنتجات التي قد تنال إعجابك", "Discover more products you might love")}
                </p>
              </div>

              <RecommendedProducts />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function RecommendedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { t, language } = useLanguage()
  const { addToCart } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const q = query(collection(db, "products"), where("isActive", "==", true), where("quantity", ">", 0), limit(4))
        const snapshot = await getDocs(q)
        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[]
        setProducts(productsData)
      } catch (error) {
        console.error("[v0] Error fetching recommended products:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchRecommended()
  }, [])

  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product.id,
      product,
      quantity: 1,
      selectedColor: product.colors[0] || "",
      selectedSize: product.sizes[0] || "",
    })
    toast({
      title: t("تمت الإضافة", "Added"),
      description: t("تم إضافة المنتج إلى السلة", "Product added to cart"),
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (products.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <div
          key={product.id}
          className="bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="relative w-full h-64 bg-muted overflow-hidden group">
            {product.mainImage ? (
              <Image
                src={product.mainImage || "/placeholder.svg"}
                alt={language === "ar" ? product.nameAr : product.nameEn}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <Package className="w-12 h-12 text-muted-foreground/50" />
              </div>
            )}

            {product.discount > 0 && (
              <Badge className="absolute top-4 right-4 bg-destructive hover:bg-destructive">
                {t(`خصم ${product.discount}%`, `-${product.discount}%`)}
              </Badge>
            )}
          </div>

          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-foreground line-clamp-2">
              {language === "ar" ? product.nameAr : product.nameEn}
            </h3>

            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">
                {product.discount > 0 ? `${product.discountedPrice.toFixed(2)}` : `${product.salePrice.toFixed(2)}`}
                {t(" ج.م", " EGP")}
              </span>
              {product.discount > 0 && (
                <span className="text-sm text-muted-foreground line-through">{product.salePrice.toFixed(2)}</span>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Link href={`/product/${product.id}`} className="flex-1">
                <Button variant="outline" className="w-full gap-2 bg-transparent text-sm">
                  <Eye className="w-4 h-4" />
                  {t("عرض", "View")}
                </Button>
              </Link>
              <Button className="flex-1 gap-2 text-sm" onClick={() => handleAddToCart(product)}>
                <ShoppingCart className="w-4 h-4" />
                {t("شراء", "Buy")}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
