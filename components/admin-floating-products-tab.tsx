"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import { Sparkles, Check, Loader2, RefreshCw } from "lucide-react"
import type { Product } from "@/lib/types"
import { cn } from "@/lib/utils"

export function AdminFloatingProductsTab() {
  const { t, language } = useLanguage()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch all products
      const productsSnap = await getDocs(collection(db, "products"))
      const productsData = productsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Product[]
      // Filter only active products with required fields
      const activeProducts = productsData.filter((p) => p.isActive && p.mainImage && p.nameEn)
      setProducts(activeProducts)

      // Fetch current selected products from settings
      const settingsDoc = await getDoc(doc(db, "settings", "floating_products"))
      if (settingsDoc.exists()) {
        const data = settingsDoc.data()
        if (data && Array.isArray(data.productIds)) {
          setSelectedProducts(data.productIds)
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: t("خطأ", "Error"),
        description: t("فشل تحميل البيانات", "Failed to load data"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleProduct = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId))
    } else {
      if (selectedProducts.length >= 3) {
        toast({
          title: t("تنبيه", "Warning"),
          description: t("يمكنك اختيار 3 منتجات فقط", "You can only select 3 products"),
          variant: "destructive",
        })
        return
      }
      setSelectedProducts([...selectedProducts, productId])
    }
  }

  const handleSave = async () => {
    if (selectedProducts.length !== 3) {
      toast({
        title: t("تنبيه", "Warning"),
        description: t("يجب اختيار 3 منتجات بالضبط", "You must select exactly 3 products"),
        variant: "destructive",
      })
      return
    }

    // Verify all selected products exist and are valid
    const selectedProductsData = selectedProducts.map((id) => products.find((p) => p.id === id)).filter(Boolean)
    if (selectedProductsData.length !== 3) {
      toast({
        title: t("خطأ", "Error"),
        description: t("بعض المنتجات المختارة غير صحيحة", "Some selected products are invalid"),
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      await setDoc(doc(db, "settings", "floating_products"), {
        productIds: selectedProducts,
        updatedAt: new Date(),
      })

      toast({
        title: t("تم الحفظ", "Saved"),
        description: t("تم حفظ المنتجات المميزة بنجاح", "Featured products saved successfully"),
      })
    } catch (error) {
      console.error("Error saving:", error)
      toast({
        title: t("خطأ", "Error"),
        description: t("فشل حفظ المنتجات", "Failed to save products"),
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-background rounded-2xl border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-serif">
              {t("المنتجات المميزة (العائمة)", "Featured Products (Floating)")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("اختر 3 منتجات لعرضها في قسم المنتجات المميزة", "Select 3 products to display in the featured section")}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(selectedProducts.length / 3) * 100}%` }}
              />
            </div>
          </div>
          <Badge variant={selectedProducts.length === 3 ? "default" : "secondary"}>
            {selectedProducts.length} / 3
          </Badge>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={selectedProducts.length !== 3 || saving}
          size="lg"
          className="gap-2"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Check className="h-5 w-5" />
          )}
          {t("حفظ المنتجات المختارة", "Save Selected Products")}
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => {
          const isSelected = selectedProducts.includes(product.id)
          const selectionIndex = selectedProducts.indexOf(product.id)

          return (
            <Card
              key={product.id}
              onClick={() => handleToggleProduct(product.id)}
              className={cn(
                "relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg",
                isSelected ? "ring-4 ring-primary shadow-xl" : ""
              )}
            >
              {/* Selection Badge */}
              {isSelected && (
                <div className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">{selectionIndex + 1}</span>
                </div>
              )}

              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={product.mainImage || "/placeholder.svg"}
                  alt={language === "ar" ? product.nameAr : product.nameEn}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Check Icon */}
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-8 w-8 text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold mb-2 line-clamp-1">
                  {language === "ar" ? product.nameAr : product.nameEn}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    {product.discountedPrice || product.salePrice} {t("ج.م", "EGP")}
                  </span>
                  {product.discount > 0 && (
                    <Badge variant="destructive">-{product.discount}%</Badge>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-xl text-muted-foreground">
            {t("لا توجد منتجات نشطة", "No active products available")}
          </p>
        </div>
      )}
    </div>
  )
}
