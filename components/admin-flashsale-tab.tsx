"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { doc, getDoc, setDoc, collection, getDocs, where, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"
import {
  Zap,
  Save,
  Loader2,
  Package,
  Clock,
  Percent,
  Calendar,
  Search,
  X,
  Check,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react"

interface FlashSaleData {
  titleAr: string
  titleEn: string
  discountPercent: number
  startDate: string
  endDate: string
  productIds: string[]
  isActive: boolean
}

export function AdminFlashSaleTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState<FlashSaleData>({
    titleAr: "",
    titleEn: "",
    discountPercent: 20,
    startDate: "",
    endDate: "",
    productIds: [],
    isActive: false,
  })

  const { t, language } = useLanguage()
  const { toast } = useToast()

  const getSaleStatus = () => {
    if (!formData.startDate || !formData.endDate) {
      return { type: "warning", message: t("يرجى تحديد التواريخ", "Please set dates") }
    }

    const now = new Date()
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)

    if (end <= start) {
      return {
        type: "error",
        message: t("تاريخ النهاية يجب أن يكون بعد تاريخ البداية", "End date must be after start date"),
      }
    }

    if (end < now) {
      return { type: "warning", message: t("العرض منتهي", "Sale expired") }
    }

    if (start > now) {
      const daysUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return { type: "info", message: t(`العرض سيبدأ خلال ${daysUntil} يوم`, `Sale starts in ${daysUntil} days`) }
    }

    if (start <= now && end >= now) {
      const hoursLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60))
      return {
        type: "success",
        message: t(`العرض نشط - يتبقى ${hoursLeft} ساعة`, `Sale active - ${hoursLeft} hours left`),
      }
    }

    return { type: "info", message: t("حدد التواريخ", "Set dates") }
  }

  const saleStatus = getSaleStatus()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all active products
        const productsQuery = query(collection(db, "products"), where("isActive", "==", true))
        const productsSnap = await getDocs(productsQuery)
        const productsData = productsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[]
        setProducts(productsData)

        // Fetch current flash sale settings
        const settingsRef = doc(db, "settings", "flashSale")
        const settingsSnap = await getDoc(settingsRef)

        if (settingsSnap.exists()) {
          const data = settingsSnap.data()
          setFormData({
            titleAr: data.titleAr || "",
            titleEn: data.titleEn || "",
            discountPercent: data.discountPercent || 20,
            startDate: data.startDate?.toDate?.()?.toISOString().slice(0, 16) || data.startDate || "",
            endDate: data.endDate?.toDate?.()?.toISOString().slice(0, 16) || data.endDate || "",
            productIds: data.productIds || [],
            isActive: data.isActive || false,
          })
        }
      } catch (error) {
        console.error("[v0] Error fetching flash sale data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const toggleProduct = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId],
    }))
  }

  const handleSave = async () => {
    if (!formData.titleAr || !formData.titleEn) {
      toast({
        title: t("خطأ", "Error"),
        description: t("يرجى إدخال العنوان بالعربية والإنجليزية", "Please enter title in both languages"),
        variant: "destructive",
      })
      return
    }

    if (!formData.startDate || !formData.endDate) {
      toast({
        title: t("خطأ", "Error"),
        description: t("يرجى تحديد تاريخ البداية والنهاية", "Please set start and end dates"),
        variant: "destructive",
      })
      return
    }

    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)

    if (end <= start) {
      toast({
        title: t("خطأ", "Error"),
        description: t("تاريخ النهاية يجب أن يكون بعد تاريخ البداية", "End date must be after start date"),
        variant: "destructive",
      })
      return
    }

    if (formData.productIds.length === 0) {
      toast({
        title: t("خطأ", "Error"),
        description: t("يرجى اختيار منتج واحد على الأقل", "Please select at least one product"),
        variant: "destructive",
      })
      return
    }

    if (formData.discountPercent < 1 || formData.discountPercent > 99) {
      toast({
        title: t("خطأ", "Error"),
        description: t("نسبة الخصم يجب أن تكون بين 1% و 99%", "Discount must be between 1% and 99%"),
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      await setDoc(doc(db, "settings", "flashSale"), {
        ...formData,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
      })
      toast({
        title: t("تم الحفظ", "Saved"),
        description: t("تم حفظ إعدادات العرض السريع بنجاح", "Flash sale settings saved successfully"),
      })
    } catch (error) {
      console.error("[v0] Error saving:", error)
      toast({
        title: t("خطأ", "Error"),
        description: t("حدث خطأ أثناء الحفظ", "Error saving settings"),
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const filteredProducts = products.filter((product) => {
    const name = language === "ar" ? product.nameAr : product.nameEn
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Alert
        className={`border-2 ${
          saleStatus.type === "success"
            ? "border-green-500 bg-green-50"
            : saleStatus.type === "error"
              ? "border-red-500 bg-red-50"
              : saleStatus.type === "warning"
                ? "border-yellow-500 bg-yellow-50"
                : "border-blue-500 bg-blue-50"
        }`}
      >
        <div className="flex items-center gap-2">
          {saleStatus.type === "success" && <CheckCircle className="w-5 h-5 text-green-600" />}
          {saleStatus.type === "error" && <AlertTriangle className="w-5 h-5 text-red-600" />}
          {saleStatus.type === "warning" && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
          {saleStatus.type === "info" && <Info className="w-5 h-5 text-blue-600" />}
          <AlertDescription
            className={`font-semibold ${
              saleStatus.type === "success"
                ? "text-green-800"
                : saleStatus.type === "error"
                  ? "text-red-800"
                  : saleStatus.type === "warning"
                    ? "text-yellow-800"
                    : "text-blue-800"
            }`}
          >
            {saleStatus.message}
          </AlertDescription>
        </div>
      </Alert>

      {/* Header */}
      <div className="bg-background rounded-2xl border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{t("العروض السريعة", "Flash Sale")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("إنشاء عروض محدودة الوقت", "Create time-limited offers")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
            />
            <span className="text-sm font-medium">
              {formData.isActive ? t("نشط", "Active") : t("متوقف", "Inactive")}
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sale Settings */}
        <div className="bg-background rounded-2xl border p-6 space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            {t("إعدادات العرض", "Sale Settings")}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t("العنوان (عربي)", "Title (Arabic)")}</Label>
              <Input
                value={formData.titleAr}
                onChange={(e) => setFormData((prev) => ({ ...prev, titleAr: e.target.value }))}
                placeholder={t("عروض حصرية", "Exclusive Deals")}
              />
            </div>
            <div>
              <Label>{t("العنوان (إنجليزي)", "Title (English)")}</Label>
              <Input
                value={formData.titleEn}
                onChange={(e) => setFormData((prev) => ({ ...prev, titleEn: e.target.value }))}
                placeholder="Exclusive Deals"
              />
            </div>
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <Percent className="w-4 h-4" />
              {t("نسبة الخصم", "Discount Percentage")}
            </Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min="1"
                max="99"
                value={formData.discountPercent}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, discountPercent: Number.parseInt(e.target.value) || 0 }))
                }
                className="w-24"
              />
              <span className="text-lg font-bold text-red-500">%</span>
              <Badge className="bg-red-100 text-red-600">
                {t(`خصم ${formData.discountPercent}%`, `${formData.discountPercent}% OFF`)}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t("تاريخ البداية", "Start Date")}
              </Label>
              <Input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
              />
              {formData.startDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(formData.startDate).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t("تاريخ النهاية", "End Date")}
              </Label>
              <Input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
              />
              {formData.endDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(formData.endDate).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Selected Products Count */}
        <div className="bg-background rounded-2xl border p-6 space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            {t("المنتجات المختارة", "Selected Products")}
            <Badge className="ms-auto">{formData.productIds.length}</Badge>
          </h3>

          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {formData.productIds.map((id) => {
              const product = products.find((p) => p.id === id)
              if (!product) return null
              return (
                <Badge key={id} className="bg-primary/10 text-primary gap-1 px-3 py-1">
                  {(language === "ar" ? product.nameAr : product.nameEn).slice(0, 20)}...
                  <button onClick={() => toggleProduct(id)} className="hover:bg-primary/20 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )
            })}
            {formData.productIds.length === 0 && (
              <p className="text-muted-foreground text-sm">{t("لم يتم اختيار منتجات", "No products selected")}</p>
            )}
          </div>
        </div>
      </div>

      {/* Product Selection */}
      <div className="bg-background rounded-2xl border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{t("اختر المنتجات للعرض", "Select Products for Sale")}</h3>
          <div className="relative w-64">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("بحث...", "Search...")}
              className="ps-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-h-96 overflow-y-auto p-1">
          {filteredProducts.map((product) => {
            const isSelected = formData.productIds.includes(product.id)
            const name = language === "ar" ? product.nameAr : product.nameEn

            return (
              <button
                key={product.id}
                onClick={() => toggleProduct(product.id)}
                className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                  isSelected ? "border-primary ring-2 ring-primary/20" : "border-muted hover:border-primary/50"
                }`}
              >
                <div className="aspect-square relative">
                  <Image
                    src={product.mainImage || "/placeholder.svg?height=150&width=150&query=product"}
                    alt={name}
                    fill
                    className="object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-2 bg-background">
                  <p className="text-xs font-medium truncate">{name}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.salePrice} {t("ج.م", "EGP")}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2 px-8">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {t("حفظ التغييرات", "Save Changes")}
        </Button>
      </div>
    </div>
  )
}
