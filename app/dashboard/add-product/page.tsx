"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import {
  CATEGORIES,
  COLORS,
  SIZES,
  PRODUCT_TYPES,
  OUTFIT_ITEM_TYPES,
  generateProductCode,
  type ProductType,
  type OutfitItem,
  type Product,
  type ColorSelection,
} from "@/lib/types"
import {
  ArrowRight,
  ArrowLeft,
  Upload,
  X,
  Home,
  Package,
  DollarSign,
  Palette,
  ImageIcon,
  Tag,
  FileText,
  Star,
  Check,
  Sparkles,
  Layers,
  Gift,
  CreditCard,
  Wand2,
  RefreshCw,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ColorSearchSelector } from "@/components/color-search-selector"

const productTypeIcons = {
  single: Package,
  outfit: Layers,
  bundle: Gift,
  gift: CreditCard,
  custom: Wand2,
  subscription: RefreshCw,
}

export default function AddProductPage() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const router = useRouter()
  const { t, language } = useLanguage()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const [productType, setProductType] = useState<ProductType>("single")
  const [productCodeError, setProductCodeError] = useState("")
  const [formData, setFormData] = useState({
    productCode: "",
    nameAr: "",
    nameEn: "",
    descriptionAr: "",
    descriptionEn: "",
    featuresAr: "",
    featuresEn: "",
    notesAr: "",
    notesEn: "",
    afterPurchaseNotesAr: "",
    afterPurchaseNotesEn: "",
    category: "",
    subCategory: "",
    costPrice: "",
    salePrice: "",
    discount: "",
    quantity: "",
    alertQuantity: "5",
    tax: "",
    isActive: true,
    isFeatured: false,
  })

  const [selectedColors, setSelectedColors] = useState<ColorSelection[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [mainImage, setMainImage] = useState("")
  const [additionalImages, setAdditionalImages] = useState<string[]>([])
  const [colorImages, setColorImages] = useState<{ [colorId: string]: string }>({})

  // Outfit-specific state
  const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([])
  const [outfitSizeType, setOutfitSizeType] = useState<"unified" | "individual">("unified")

  // Gift card specific state
  const [giftCardValues, setGiftCardValues] = useState<number[]>([100, 250, 500, 1000])
  const [giftCardValidity, setGiftCardValidity] = useState(365)

  // Subscription specific state
  const [subscriptionPeriod, setSubscriptionPeriod] = useState<"weekly" | "monthly" | "quarterly" | "yearly">("monthly")

  const [tags, setTags] = useState<string>("")
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  const BackArrow = language === "ar" ? ArrowRight : ArrowLeft

  const costPrice = Number.parseFloat(formData.costPrice) || 0
  const salePrice = Number.parseFloat(formData.salePrice) || 0
  const discount = Number.parseFloat(formData.discount) || 0
  const profit = salePrice - costPrice
  const discountedPrice = salePrice - (salePrice * discount) / 100

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true)
      try {
        const productsRef = collection(db, "products")
        const q = query(productsRef, orderBy("createdAt", "desc"))
        const snapshot = await getDocs(q)
        const productsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Product)
        setAllProducts(productsData)
      } catch (error) {
        console.error("[v0] Error fetching products:", error)
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchProducts()
  }, [])

  const sections = [
    { id: 0, icon: Layers, label: t("نوع المنتج", "Product Type") },
    { id: 1, icon: FileText, label: t("المعلومات الأساسية", "Basic Info") },
    { id: 2, icon: Tag, label: t("التصنيف", "Category") },
    ...(productType === "outfit" ? [{ id: 3, icon: Package, label: t("مكونات الطقم", "Outfit Items") }] : []),
    {
      id: productType === "outfit" ? 4 : 3,
      icon: Palette,
      label: t("الألوان والمقاسات", "Colors & Sizes"),
    },
    {
      id: productType === "outfit" ? 5 : 4,
      icon: ImageIcon,
      label: t("الصور", "Images"),
    },
    {
      id: productType === "outfit" ? 6 : 5,
      icon: DollarSign,
      label: t("التسعير", "Pricing"),
    },
    {
      id: productType === "outfit" ? 7 : 6,
      icon: Package,
      label: t("المخزون والحالة", "Stock & Status"),
    },
    {
      id: productType === "outfit" ? 8 : 7,
      icon: Sparkles,
      label: t("منتجات مشابهة", "Similar Products"),
    },
  ]

  // Helper to get actual section index
  const getSectionIndex = (sectionName: string) => {
    if (productType === "outfit") {
      const map: Record<string, number> = {
        type: 0,
        basic: 1,
        category: 2,
        outfitItems: 3,
        colors: 4,
        images: 5,
        pricing: 6,
        stock: 7,
        similarProducts: 8,
      }
      return map[sectionName]
    }
    const map: Record<string, number> = {
      type: 0,
      basic: 1,
      category: 2,
      colors: 3,
      images: 4,
      pricing: 5,
      stock: 6,
      similarProducts: 7,
    }
    return map[sectionName]
  }

  const handleAddOutfitItem = () => {
    setOutfitItems([...outfitItems, { nameAr: "", nameEn: "", type: "shirt" }])
  }

  const handleRemoveOutfitItem = (index: number) => {
    setOutfitItems(outfitItems.filter((_, i) => i !== index))
  }

  const handleUpdateOutfitItem = (index: number, field: keyof OutfitItem, value: string) => {
    const updated = [...outfitItems]
    updated[index] = { ...updated[index], [field]: value }
    setOutfitItems(updated)
  }

  const handleOutfitItemImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      handleUpdateOutfitItem(index, "image", result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.productCode || !formData.nameAr || !formData.nameEn || !formData.category || !formData.subCategory || !salePrice) {
      toast({
        title: t("خطأ", "Error"),
        description: t("يرجى ملء جميع الحقول المطلوبة بما فيها كود المنتج والقسم والفئة", "Please fill all required fields including product code, category and subcategory"),
        variant: "destructive",
      })
      return
    }

    if (productType === "outfit" && outfitItems.length === 0) {
      toast({
        title: t("خطأ", "Error"),
        description: t("يرجى إضافة مكونات الطقم", "Please add outfit items"),
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Check for duplicate product code
      const duplicateQuery = query(
        collection(db, "products"),
        where("productCode", "==", formData.productCode.trim())
      )
      const duplicateSnap = await getDocs(duplicateQuery)
      if (!duplicateSnap.empty) {
        setProductCodeError(t("هذا الكود خاص بمنتج آخر", "This code belongs to another product"))
        toast({
          title: t("خطأ", "Error"),
          description: t("هذا الكود خاص بمنتج آخر، يرجى اختيار كود مختلف", "This code belongs to another product, please choose a different code"),
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const productData: Record<string, any> = {
        productCode: formData.productCode.trim(),
        nameAr: formData.nameAr,
        nameEn: formData.nameEn,
        descriptionAr: formData.descriptionAr,
        descriptionEn: formData.descriptionEn,
        featuresAr: formData.featuresAr.split("\n").filter(Boolean),
        featuresEn: formData.featuresEn.split("\n").filter(Boolean),
        notesAr: formData.notesAr,
        notesEn: formData.notesEn,
        afterPurchaseNotesAr: formData.afterPurchaseNotesAr,
        afterPurchaseNotesEn: formData.afterPurchaseNotesEn,
        category: formData.category,
        subCategory: formData.subCategory,
        colors: selectedColors,
        sizes: selectedSizes,
        mainImage,
        additionalImages,
        colorImages: Object.keys(colorImages).length > 0 ? colorImages : undefined,
        costPrice,
        salePrice,
        profit,
        discount,
        discountedPrice,
        quantity: Number.parseInt(formData.quantity) || 0,
        alertQuantity: Number.parseInt(formData.alertQuantity) || 5,
        tax: Number.parseFloat(formData.tax) || 0,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured === true,
        productType,
        tags: tags
          .split("\n")
          .filter((tag) => tag.trim() !== "")
          .map((tag) => tag.trim().toLowerCase()),
        relatedProductIds,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      // Add type-specific data
      if (productType === "outfit") {
        productData.outfitItems = outfitItems
        productData.outfitSizeType = outfitSizeType
      } else if (productType === "gift") {
        productData.giftCardValues = giftCardValues
        productData.giftCardValidity = giftCardValidity
      } else if (productType === "subscription") {
        productData.subscriptionPeriod = subscriptionPeriod
        productData.subscriptionPrice = salePrice
      }

      const docRef = await addDoc(collection(db, "products"), productData)

      toast({
        title: t("تمت الإضافة بنجاح", "Added Successfully"),
        description: t("تم إضافة المنتج بنجاح", "Product added successfully"),
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("[v0] Error adding product:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      toast({
        title: t("خطأ", "Error"),
        description: errorMessage.includes("permission")
          ? t("ليس لديك صلاحيات كافية", "Missing permissions")
          : t("فشل في إضافة المنتج", "Failed to add product"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "main" | "additional") => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      if (type === "main") {
        setMainImage(result)
      } else {
        if (additionalImages.length < 6) {
          setAdditionalImages([...additionalImages, result])
        }
      }
    }
    reader.readAsDataURL(file)
  }

  const toggleRelatedProduct = (productId: string) => {
    setRelatedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  // Comprehensive validation function
  const validateSection = (sectionIndex: number): { valid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (sectionIndex === 0) {
      // Product Type section - no validation needed, always valid
      return { valid: true, errors: [] }
    }

    if (sectionIndex === 1) {
      // Basic Info section
      if (!formData.nameAr.trim()) {
        errors.push(t("اسم المنتج بالعربية مطلوب", "Product name (Arabic) is required"))
      }
      if (!formData.nameEn.trim()) {
        errors.push(t("اسم المنتج بالإنجليزية مطلوب", "Product name (English) is required"))
      }
      if (!formData.descriptionAr.trim()) {
        errors.push(t("الوصف بالعربية مطلوب", "Description (Arabic) is required"))
      }
      if (!formData.descriptionEn.trim()) {
        errors.push(t("الوصف بالإنجليزية مطلوب", "Description (English) is required"))
      }
    }

    if (sectionIndex === 2) {
      // Category section
      if (!formData.category) {
        errors.push(t("يجب اختيار قسم", "Category is required"))
      }
    }

    if (sectionIndex === getSectionIndex("outfitItems")) {
      // Outfit Items section
      if (productType === "outfit") {
        if (outfitItems.length === 0) {
          errors.push(t("يجب إضافة مكون واحد على الأقل", "At least one outfit item is required"))
        }
        outfitItems.forEach((item, idx) => {
          if (!item.nameAr.trim()) {
            errors.push(t(`اسم القطعة ${idx + 1} بالعربية مطلوب`, `Item ${idx + 1} name (Arabic) is required`))
          }
          if (!item.nameEn.trim()) {
            errors.push(t(`اسم القطعة ${idx + 1} بالإنجليزية مطلوب`, `Item ${idx + 1} name (English) is required`))
          }
        })
      }
    }

    if (sectionIndex === getSectionIndex("colors")) {
      // Colors & Sizes section
      if (selectedColors.length === 0) {
        errors.push(t("يجب اختيار لون مع درجة واحدة على الأقل", "At least one color with shade is required"))
      }
      if (selectedSizes.length === 0) {
        errors.push(t("يجب اختيار مقاس واحد على الأقل", "At least one size is required"))
      }
    }

    if (sectionIndex === getSectionIndex("images")) {
      // Images section
      if (!mainImage) {
        errors.push(t("الصورة الرئيسية مطلوبة", "Main image is required"))
      }
    }

    if (sectionIndex === getSectionIndex("pricing")) {
      // Pricing section
      const costPriceNum = Number.parseFloat(formData.costPrice) || 0
      const salePriceNum = Number.parseFloat(formData.salePrice) || 0

      if (!formData.costPrice.trim()) {
        errors.push(t("سعر الشراء مطلوب", "Cost price is required"))
      } else if (costPriceNum <= 0) {
        errors.push(t("سعر الشراء يجب أن يكون أكبر من 0", "Cost price must be greater than 0"))
      }

      if (!formData.salePrice.trim()) {
        errors.push(t("سعر البيع مطلوب", "Sale price is required"))
      } else if (salePriceNum <= 0) {
        errors.push(t("سعر البيع يجب أن يكون أكبر من 0", "Sale price must be greater than 0"))
      }

      if (formData.discount) {
        const discountNum = Number.parseFloat(formData.discount)
        if (discountNum < 0 || discountNum > 100) {
          errors.push(t("الخصم يج�� أن يكون بين 0 و 100", "Discount must be between 0 and 100"))
        }
      }

      if (formData.tax) {
        const taxNum = Number.parseFloat(formData.tax)
        if (taxNum < 0 || taxNum > 100) {
          errors.push(t("الضريبة يجب أن تكون بين 0 و 100", "Tax must be between 0 and 100"))
        }
      }
    }

    if (sectionIndex === getSectionIndex("stock")) {
      // Stock & Status section
      if (!formData.quantity.trim()) {
        errors.push(t("الكمية مطلوبة", "Quantity is required"))
      } else if (Number.parseInt(formData.quantity) < 0) {
        errors.push(t("الكمية يجب أن تكون رقماً موجباً", "Quantity must be a positive number"))
      }
    }

    return { valid: errors.length === 0, errors }
  }

  // Handle next section with validation
  const handleNextSection = (nextSectionIndex: number) => {
    const { valid, errors } = validateSection(activeSection)

    if (!valid) {
      toast({
        title: t("تنبيه", "Validation Error"),
        description: errors.join("\n"),
        variant: "destructive",
      })
      return
    }

    setActiveSection(nextSectionIndex)
  }

  // Handle previous section without validation
  const handlePreviousSection = (prevSectionIndex: number) => {
    setActiveSection(prevSectionIndex)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <BackArrow className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">{t("إضافة منتج جديد", "Add New Product")}</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {t("أضف منتجاً جديداً للمتجر", "Add a new product to store")}
                  </p>
                </div>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">{t("الرئيسية", "Home")}</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-background rounded-2xl border p-4 space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  <section.icon className="w-4 h-4" />
                  <span>{section.label}</span>
                  {activeSection > section.id && <Check className="w-4 h-4 ms-auto text-emerald-500" />}
                </button>
              ))}
            </div>
          </aside>

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="flex-1 space-y-6">
            {/* Mobile Progress */}
            <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <section.icon className="w-4 h-4" />
                  {section.label}
                </button>
              ))}
            </div>

            {/* Section 0: Product Type Selection */}
            {activeSection === 0 && (
              <div className="bg-background rounded-2xl border p-6 animate-slide-up">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{t("نوع المنتج", "Product Type")}</h2>
                    <p className="text-sm text-muted-foreground">
                      {t("اختر نوع المنتج الذي تريد إضافته", "Select the type of product you want to add")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {PRODUCT_TYPES.map((type) => {
                    const Icon = productTypeIcons[type.id as keyof typeof productTypeIcons]
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setProductType(type.id as ProductType)}
                        className={cn(
                          "relative flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg",
                          productType === type.id
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border hover:border-primary/50",
                        )}
                      >
                        {productType === type.id && (
                          <div className="absolute top-3 end-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center transition-all",
                            productType === type.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          <Icon className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-foreground">{t(type.nameAr, type.nameEn)}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {type.id === "single" && t("منتج واحد بسيط", "Simple single item")}
                            {type.id === "outfit" && t("طقم من قطع متعددة", "Set of multiple pieces")}
                            {type.id === "bundle" && t("مجموعة منتجات", "Collection of products")}
                            {type.id === "gift" && t("بطاقة هدية قابلة للاسترداد", "Redeemable gift card")}
                            {type.id === "custom" && t("منتج قابل للتخصيص", "Customizable product")}
                            {type.id === "subscription" && t("اشتراك دوري", "Recurring subscription")}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="flex justify-end mt-6">
                  <Button type="button" onClick={() => handleNextSection(1)} className="gap-2">
                    {t("التالي", "Next")}
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Section 1: Basic Info */}
            {activeSection === 1 && (
              <div className="bg-background rounded-2xl border p-6 animate-slide-up">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      {t("المعلومات الأساسية", "Basic Information")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {productType === "outfit"
                        ? t("اسم ووصف الطقم", "Outfit name and description")
                        : t("اسم ووصف المنتج", "Product name and description")}
                    </p>
                  </div>
                </div>

                {/* Product Code Field */}
                <div className="mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="productCode" className="flex items-center gap-2">
                      {t("كود المنتج", "Product Code")}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="productCode"
                      value={formData.productCode}
                      onChange={(e) => {
                        setFormData({ ...formData, productCode: e.target.value })
                        setProductCodeError("")
                      }}
                      placeholder={t("مثال: SB-001", "Example: SB-001")}
                      className={cn(
                        "h-12 bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20 max-w-sm font-mono text-base tracking-wider",
                        productCodeError && "ring-2 ring-destructive/50"
                      )}
                      required
                    />
                    {productCodeError && (
                      <p className="text-sm text-destructive font-medium">{productCodeError}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {t("كود فريد لكل منتج - لا يمكن تكراره", "Unique code per product - cannot be duplicated")}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nameAr" className="flex items-center gap-2">
                      {productType === "outfit"
                        ? t("اسم الطقم (عربي)", "Outfit Name (Arabic)")
                        : t("اسم المنتج (عربي)", "Product Name (Arabic)")}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nameAr"
                      value={formData.nameAr}
                      onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                      placeholder={
                        productType === "outfit"
                          ? t("مثال: طقم رسمي كلاسيكي", "Example: Classic Formal Set")
                          : t("مثال: قميص قطني أنيق", "Example: Elegant Cotton Shirt")
                      }
                      className="h-12 bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameEn" className="flex items-center gap-2">
                      {productType === "outfit"
                        ? t("اسم الطقم (إنجليزي)", "Outfit Name (English)")
                        : t("اسم المنتج (إنجليزي)", "Product Name (English)")}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nameEn"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      placeholder={productType === "outfit" ? "Classic Formal Set" : "Elegant Cotton Shirt"}
                      className="h-12 bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descriptionAr">{t("الوصف (عربي)", "Description (Arabic)")}</Label>
                    <Textarea
                      id="descriptionAr"
                      value={formData.descriptionAr}
                      onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                      rows={4}
                      className="bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20 resize-none"
                      placeholder={
                        productType === "outfit"
                          ? t(
                              "وصف تفصيلي للطقم ومكوناته...",
                              "Detailed description of the outfit and its components...",
                            )
                          : t("أدخل وصفاً تفصيلياً للمنتج...", "Enter detailed product description...")
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descriptionEn">{t("الوصف (إنجليزي)", "Description (English)")}</Label>
                    <Textarea
                      id="descriptionEn"
                      value={formData.descriptionEn}
                      onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                      rows={4}
                      className="bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20 resize-none"
                      placeholder="Enter detailed product description..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="featuresAr">
                      {t("المميزات (عربي) - سطر لكل ميزة", "Features (Arabic) - One per line")}
                    </Label>
                    <Textarea
                      id="featuresAr"
                      value={formData.featuresAr}
                      onChange={(e) => setFormData({ ...formData, featuresAr: e.target.value })}
                      rows={3}
                      className="bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20 resize-none"
                      placeholder={t("قطن 100%\nمريح\nسهل الغسيل", "100% Cotton\nComfortable\nEasy to wash")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="featuresEn">{t("المميزات (إنجليزي)", "Features (English)")}</Label>
                    <Textarea
                      id="featuresEn"
                      value={formData.featuresEn}
                      onChange={(e) => setFormData({ ...formData, featuresEn: e.target.value })}
                      rows={3}
                      className="bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20 resize-none"
                      placeholder="100% Cotton\nComfortable\nEasy to wash"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notesAr">{t("ملاحظات (عربي)", "Notes (Arabic)")}</Label>
                    <Textarea
                      id="notesAr"
                      value={formData.notesAr}
                      onChange={(e) => setFormData({ ...formData, notesAr: e.target.value })}
                      rows={2}
                      className="bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20 resize-none"
                      placeholder={t("ملاحظات إضافية...", "Additional notes...")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notesEn">{t("ملاحظات (إنجليزي)", "Notes (English)")}</Label>
                    <Textarea
                      id="notesEn"
                      value={formData.notesEn}
                      onChange={(e) => setFormData({ ...formData, notesEn: e.target.value })}
                      rows={2}
                      className="bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20 resize-none"
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handlePreviousSection(0)}
                    className="gap-2 bg-transparent"
                  >
                    <ArrowRight className="w-4 h-4" />
                    {t("السابق", "Previous")}
                  </Button>
                  <Button type="button" onClick={() => handleNextSection(2)} className="gap-2">
                    {t("التالي", "Next")}
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Section 2: Category */}
            {activeSection === 2 && (
              <div className="bg-background rounded-2xl border p-6 animate-slide-up">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Tag className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{t("التصنيف", "Category")}</h2>
                    <p className="text-sm text-muted-foreground">
                      {t("اختر قسم وفئة المنتج", "Select product category")}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      {t("القسم الرئيسي", "Main Category")}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => {
                        setFormData({ ...formData, category: value, subCategory: "" })
                      }}
                    >
                      <SelectTrigger className="h-12 bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder={t("اختر القسم", "Select Category")} />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {t(cat.nameAr, cat.nameEn)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("الفئة", "Sub Category")}</Label>
                    <Select
                      value={formData.subCategory}
                      onValueChange={(value) => setFormData({ ...formData, subCategory: value })}
                    >
                      <SelectTrigger className="h-12 bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder={t("اختر الفئة", "Select Sub Category")} />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.category
                          ? CATEGORIES.find((c) => c.id === formData.category)?.subCategories.map((sub) => (
                              <SelectItem key={sub.id} value={sub.id}>
                                {t(sub.nameAr, sub.nameEn)}
                              </SelectItem>
                            ))
                          : null}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handlePreviousSection(1)}
                    className="gap-2 bg-transparent"
                  >
                    <ArrowRight className="w-4 h-4" />
                    {t("السابق", "Previous")}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleNextSection(productType === "outfit" ? 3 : getSectionIndex("colors"))}
                    className="gap-2"
                  >
                    {t("التالي", "Next")}
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Section 3: Outfit Items (Only for outfit type) */}
            {productType === "outfit" && activeSection === 3 && (
              <div className="bg-background rounded-2xl border p-6 animate-slide-up">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{t("مكونات الطقم", "Outfit Components")}</h2>
                    <p className="text-sm text-muted-foreground">
                      {t("أضف القطع التي يتكون منها الطقم", "Add the pieces that make up the outfit")}
                    </p>
                  </div>
                </div>

                {/* Size Type Selection */}
                <div className="mb-6 p-4 bg-muted/50 rounded-xl">
                  <Label className="text-base font-semibold mb-4 block">
                    {t("طريقة اختيار المقاس", "Size Selection Method")}
                  </Label>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => setOutfitSizeType("unified")}
                      className={cn(
                        "flex-1 min-w-48 p-4 rounded-xl border-2 transition-all",
                        outfitSizeType === "unified"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            outfitSizeType === "unified" ? "bg-primary text-primary-foreground" : "bg-muted",
                          )}
                        >
                          <Package className="w-5 h-5" />
                        </div>
                        <div className="text-start">
                          <p className="font-semibold">{t("مقاس موحد", "Unified Size")}</p>
                          <p className="text-xs text-muted-foreground">
                            {t("مقاس واحد لجميع القطع", "One size for all pieces")}
                          </p>
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOutfitSizeType("individual")}
                      className={cn(
                        "flex-1 min-w-48 p-4 rounded-xl border-2 transition-all",
                        outfitSizeType === "individual"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            outfitSizeType === "individual" ? "bg-primary text-primary-foreground" : "bg-muted",
                          )}
                        >
                          <Layers className="w-5 h-5" />
                        </div>
                        <div className="text-start">
                          <p className="font-semibold">{t("مقاس لكل قطعة", "Size Per Piece")}</p>
                          <p className="text-xs text-muted-foreground">
                            {t("اختيار مقاس منفصل لكل قطعة", "Choose size for each piece")}
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Outfit Items List */}
                <div className="space-y-4">
                  {outfitItems.map((item, index) => (
                    <div key={index} className="p-4 bg-muted/30 rounded-xl border">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {index + 1}
                        </div>

                        <div className="flex-1 grid md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label>{t("نوع القطعة", "Item Type")}</Label>
                            <Select
                              value={item.type}
                              onValueChange={(value) => handleUpdateOutfitItem(index, "type", value)}
                            >
                              <SelectTrigger className="h-10 bg-background">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {OUTFIT_ITEM_TYPES.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {t(type.nameAr, type.nameEn)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>{t("الاسم (عربي)", "Name (Arabic)")}</Label>
                            <Input
                              value={item.nameAr}
                              onChange={(e) => handleUpdateOutfitItem(index, "nameAr", e.target.value)}
                              placeholder={t("قميص أبيض", "White Shirt")}
                              className="h-10 bg-background"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>{t("الاسم (إنجليزي)", "Name (English)")}</Label>
                            <Input
                              value={item.nameEn}
                              onChange={(e) => handleUpdateOutfitItem(index, "nameEn", e.target.value)}
                              placeholder="White Shirt"
                              className="h-10 bg-background"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>{t("صورة القطعة", "Item Image")}</Label>
                            {item.image ? (
                              <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
                                <Image
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.nameAr}
                                  fill
                                  className="object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateOutfitItem(index, "image", "")}
                                  className="absolute top-1 end-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <label className="w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                                <Upload className="w-4 h-4 text-muted-foreground" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleOutfitItemImageUpload(index, e)}
                                />
                              </label>
                            )}
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOutfitItem(index)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddOutfitItem}
                    className="w-full h-14 border-dashed border-2 gap-2 bg-transparent hover:bg-primary/5"
                  >
                    <Plus className="w-5 h-5" />
                    {t("إضافة قطعة جديدة", "Add New Item")}
                  </Button>
                </div>

                {outfitItems.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t("لم تتم إضافة أي قطع بعد", "No items added yet")}</p>
                    <p className="text-sm">
                      {t("أضف القطع التي يتكون منها الطقم", "Add the pieces that make up the outfit")}
                    </p>
                  </div>
                )}

                <div className="flex justify-between mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handlePreviousSection(2)}
                    className="gap-2 bg-transparent"
                  >
                    <ArrowRight className="w-4 h-4" />
                    {t("السابق", "Previous")}
                  </Button>
                  <Button type="button" onClick={() => handleNextSection(4)} className="gap-2">
                    {t("التالي", "Next")}
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Section: Colors & Sizes */}
            {activeSection === getSectionIndex("colors") && (
              <div className="bg-background rounded-2xl border p-6 animate-slide-up">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{t("الألوان والمقاسات", "Colors & Sizes")}</h2>
                    <p className="text-sm text-muted-foreground">
                      {productType === "outfit"
                        ? t("اختر الألوان والمقاسات المتاحة للطقم", "Select available colors and sizes for the outfit")
                        : t("اختر الألوان والمقاسات المتاحة", "Select available colors and sizes")}
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Colors & Shades - New System */}
                  <div className="space-y-4">
                    <ColorSearchSelector
                      value={null}
                      onChange={() => {}} // Not used in multi-select mode
                      multiSelect={true}
                      selectedColors={selectedColors}
                      onMultipleChange={setSelectedColors}
                      showLabel={true}
                      label={t("الألوان والدرجات المتاحة", "Available Colors & Shades")}
                      placeholder={t("ابحث عن لون أو درجة...", "Search for a color or shade...")}
                    />
                    {selectedColors.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {t("الألوان المختارة:", "Selected colors:")} {selectedColors.length}
                      </p>
                    )}
                  </div>

                  {/* Sizes */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">
                      {productType === "outfit" && outfitSizeType === "unified"
                        ? t("المقاسات المتاحة (موحدة لجميع القطع)", "Available Sizes (Unified for all pieces)")
                        : t("المقاسات المتاحة", "Available Sizes")}
                    </Label>
                    <div className="flex flex-wrap gap-3">
                      {SIZES.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            if (selectedSizes.includes(size)) {
                              setSelectedSizes(selectedSizes.filter((s) => s !== size))
                            } else {
                              setSelectedSizes([...selectedSizes, size])
                            }
                          }}
                          className={cn(
                            "w-14 h-14 rounded-xl border-2 font-semibold transition-all duration-300 hover:scale-105",
                            selectedSizes.includes(size)
                              ? "border-primary bg-primary text-primary-foreground shadow-lg"
                              : "border-border bg-muted/50 text-foreground",
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handlePreviousSection(productType === "outfit" ? 3 : 2)}
                    className="gap-2 bg-transparent"
                  >
                    <ArrowRight className="w-4 h-4" />
                    {t("السابق", "Previous")}
                  </Button>
                  <Button type="button" onClick={() => handleNextSection(getSectionIndex("images"))} className="gap-2">
                    {t("التالي", "Next")}
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Section: Images */}
            {activeSection === getSectionIndex("images") && (
              <div className="bg-background rounded-2xl border p-6 animate-slide-up">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      {productType === "outfit" ? t("صور الطقم", "Outfit Images") : t("صور المنت��", "Product Images")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {productType === "outfit"
                        ? t(
                            "أضف صور الطقم كاملاً والقطع المنفصلة",
                            "Add images of the complete outfit and separate pieces",
                          )
                        : t("أضف صور المنتج", "Add product images")}
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Main Image */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">
                      {productType === "outfit"
                        ? t("الصورة الرئيسية (الطقم كاملاً)", "Main Image (Complete Outfit)")
                        : t("الصورة الرئيسية", "Main Image")}
                    </Label>
                    <div className="flex items-start gap-4">
                      {mainImage ? (
                        <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-2 border-primary">
                          <Image src={mainImage || "/placeholder.svg"} alt="Main" fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => setMainImage("")}
                            className="absolute top-2 end-2 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-0 inset-x-0 bg-primary/90 text-primary-foreground text-xs text-center py-1">
                            {t("الصورة الرئيسية", "Main Image")}
                          </div>
                        </div>
                      ) : (
                        <label className="w-40 h-40 border-2 border-dashed border-primary/30 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300">
                          <Upload className="h-8 w-8 text-primary mb-2" />
                          <span className="text-sm text-primary font-medium">{t("رفع صورة", "Upload")}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, "main")}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Additional Images */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">
                      {t("صور إضافية (حد أقصى 6)", "Additional Images (Max 6)")}
                    </Label>
                    <div className="flex flex-wrap items-center gap-4">
                      {additionalImages.map((img, index) => (
                        <div key={index} className="relative w-28 h-28 rounded-xl overflow-hidden border">
                          <Image
                            src={img || "/placeholder.svg"}
                            alt={`Additional ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setAdditionalImages(additionalImages.filter((_, i) => i !== index))}
                            className="absolute top-2 end-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {additionalImages.length < 6 && (
                        <label className="w-28 h-28 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300">
                          <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">{t("رفع", "Upload")}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, "additional")}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Color-specific Images (Optional Advanced Feature) */}
                  {selectedColors.length > 0 && (
                    <div className="space-y-4 pt-6 border-t">
                      <div className="flex items-start justify-between">
                        <div>
                          <Label className="text-base font-semibold block mb-2">
                            {t("صور خاصة بالألوان (اختياري)", "Color-Specific Images (Optional)")}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {t(
                              "رفع صور مختلفة لكل لون (عند الضغط على اللون سيتم عرض الصورة الخاصة به)",
                              "Upload different images for each color (clicking the color will show its image)",
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4">
                        {selectedColors.map((colorSelection) => {
                          const variant = selectedColors.find(c => c.shadeId === colorSelection.shadeId)
                          if (!variant) return null
                          
                          const hex = COLORS.find(c => c.id === colorSelection.colorId)?.variants.find(v => v.id === colorSelection.shadeId)?.hex
                          
                          return (
                            <div key={colorSelection.shadeId} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                              <div
                                className="w-12 h-12 rounded-lg border-2 flex-shrink-0"
                                style={{ backgroundColor: hex || '#cccccc' }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground mb-2">
                                  {colorSelection.label}
                                </p>
                                {colorImages[colorSelection.shadeId] ? (
                                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2">
                                    <Image
                                      src={colorImages[colorSelection.shadeId]}
                                      alt={colorSelection.label}
                                      fill
                                      className="object-cover"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newColorImages = { ...colorImages }
                                        delete newColorImages[colorSelection.shadeId]
                                        setColorImages(newColorImages)
                                      }}
                                      className="absolute top-2 end-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-primary/30 hover:border-primary cursor-pointer transition-colors">
                                    <Upload className="w-4 h-4 text-primary" />
                                    <span className="text-sm text-primary font-medium">{t("رفع صورة", "Upload")}</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (!file) return
                                        const reader = new FileReader()
                                        reader.onloadend = () => {
                                          setColorImages({
                                            ...colorImages,
                                            [colorSelection.shadeId]: reader.result as string
                                          })
                                        }
                                        reader.readAsDataURL(file)
                                      }}
                                    />
                                  </label>
                                )}
                              </div>
                                <p className="text-sm font-medium">{t(color?.nameAr || "لون", color?.nameEn || "Color")}</p>
                                {colorImages[colorHex] ? (
                                  <div className="flex items-center gap-3 mt-2">
                                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                      <Image src={colorImages[colorHex]} alt={`${colorHex} image`} fill className="object-cover" />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setColorImages({ ...colorImages, [colorHex]: "" })}
                                      className="text-sm px-3 py-1 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-colors"
                                    >
                                      {t("إزالة", "Remove")}
                                    </button>
                                  </div>
                                ) : (
                                  <label className="flex items-center justify-center gap-2 mt-2 px-3 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                                    <Upload className="w-4 h-4" />
                                    <span className="text-xs">{t("رفع صورة", "Upload")}</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (!file) return
                                        const reader = new FileReader()
                                        reader.onloadend = () => {
                                          const result = reader.result as string
                                          setColorImages({ ...colorImages, [colorHex]: result })
                                        }
                                        reader.readAsDataURL(file)
                                      }}
                                    />
                                  </label>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handlePreviousSection(getSectionIndex("colors"))}
                    className="gap-2 bg-transparent"
                  >
                    <ArrowRight className="w-4 h-4" />
                    {t("السابق", "Previous")}
                  </Button>
                  <Button type="button" onClick={() => handleNextSection(getSectionIndex("pricing"))} className="gap-2">
                    {t("التالي", "Next")}
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Section: Pricing */}
            {activeSection === getSectionIndex("pricing") && (
              <div className="bg-background rounded-2xl border p-6 animate-slide-up">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{t("التسعير", "Pricing")}</h2>
                    <p className="text-sm text-muted-foreground">
                      {productType === "outfit"
                        ? t("سعر الطقم كاملاً والخصومات", "Complete outfit price and discounts")
                        : t("أسعار المنتج والخصومات", "Product pricing and discounts")}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="costPrice">{t("سعر الشراء", "Cost Price")}</Label>
                    <div className="relative">
                      <Input
                        id="costPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.costPrice}
                        onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                        placeholder="0.00"
                        className="h-12 bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20 pe-12"
                      />
                      <span className="absolute end-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        {t("ج.م", "EGP")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salePrice" className="flex items-center gap-2">
                      {productType === "outfit"
                        ? t("سعر البيع (الطقم كاملاً)", "Sale Price (Complete Outfit)")
                        : t("سعر البيع", "Sale Price")}
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="salePrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.salePrice}
                        onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                        placeholder="0.00"
                        className="h-12 bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20 pe-12"
                        required
                      />
                      <span className="absolute end-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        {t("ج.م", "EGP")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("المكسب", "Profit")}</Label>
                    <div
                      className={cn(
                        "h-12 rounded-xl flex items-center justify-center font-bold text-lg",
                        profit >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-destructive/10 text-destructive",
                      )}
                    >
                      {profit.toFixed(2)} {t("ج.م", "EGP")}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount">{t("الخصم (%)", "Discount (%)")}</Label>
                    <div className="relative">
                      <Input
                        id="discount"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                        placeholder="0"
                        className="h-12 bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20 pe-12"
                      />
                      <span className="absolute end-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("السعر بعد الخصم", "Price After Discount")}</Label>
                    <div className="h-12 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-lg text-primary">
                      {discountedPrice.toFixed(2)} {t("ج.م", "EGP")}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax">{t("الضريبة", "Tax")}</Label>
                    <div className="relative">
                      <Input
                        id="tax"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.tax}
                        onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                        placeholder="0.00"
                        className="h-12 bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20 pe-12"
                      />
                      <span className="absolute end-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        {t("ج.م", "EGP")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gift Card specific pricing */}
                {productType === "gift" && (
                  <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <Label className="text-base font-semibold mb-4 block text-amber-800">
                      {t("قيم بطاقات الهدايا", "Gift Card Values")}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {giftCardValues.map((value, index) => (
                        <div key={index} className="flex items-center gap-1 bg-white px-3 py-2 rounded-lg border">
                          <span className="font-medium">
                            {value} {t("ج.م", "EGP")}
                          </span>
                          <button
                            type="button"
                            onClick={() => setGiftCardValues(giftCardValues.filter((_, i) => i !== index))}
                            className="text-destructive hover:bg-destructive/10 rounded p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <Input
                        type="number"
                        placeholder={t("قيمة جديدة", "New value")}
                        className="w-32 h-10"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            const value = Number((e.target as HTMLInputElement).value)
                            if (value > 0 && !giftCardValues.includes(value)) {
                              setGiftCardValues([...giftCardValues, value])
                              ;(e.target as HTMLInputElement).value = ""
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="mt-4">
                      <Label>{t("صلاحية البطاقة (أيام)", "Card Validity (Days)")}</Label>
                      <Input
                        type="number"
                        value={giftCardValidity}
                        onChange={(e) => setGiftCardValidity(Number(e.target.value))}
                        className="w-32 mt-2"
                      />
                    </div>
                  </div>
                )}

                {/* Subscription specific pricing */}
                {productType === "subscription" && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <Label className="text-base font-semibold mb-4 block text-blue-800">
                      {t("فترة الاشتراك", "Subscription Period")}
                    </Label>
                    <div className="flex flex-wrap gap-3">
                      {(["weekly", "monthly", "quarterly", "yearly"] as const).map((period) => (
                        <button
                          key={period}
                          type="button"
                          onClick={() => setSubscriptionPeriod(period)}
                          className={cn(
                            "px-4 py-2 rounded-lg border-2 font-medium transition-all",
                            subscriptionPeriod === period
                              ? "border-blue-500 bg-blue-500 text-white"
                              : "border-blue-200 hover:border-blue-300",
                          )}
                        >
                          {period === "weekly" && t("أسبوعي", "Weekly")}
                          {period === "monthly" && t("شهري", "Monthly")}
                          {period === "quarterly" && t("ربع سنوي", "Quarterly")}
                          {period === "yearly" && t("سنوي", "Yearly")}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handlePreviousSection(getSectionIndex("images"))}
                    className="gap-2 bg-transparent"
                  >
                    <ArrowRight className="w-4 h-4" />
                    {t("السابق", "Previous")}
                  </Button>
                  <Button type="button" onClick={() => handleNextSection(getSectionIndex("stock"))} className="gap-2">
                    {t("التالي", "Next")}
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Section: Stock & Status */}
            {activeSection === getSectionIndex("stock") && (
              <div className="bg-background rounded-2xl border p-6 animate-slide-up">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{t("المخزون والحالة", "Stock & Status")}</h2>
                    <p className="text-sm text-muted-foreground">
                      {t("إدارة المخزون وحالة المنتج", "Manage stock and product status")}
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Stock */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">
                        {productType === "outfit"
                          ? t("عدد الأطقم المتاحة", "Available Outfits")
                          : t("الكمية المتاحة", "Available Quantity")}
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="0"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        placeholder="0"
                        className="h-12 bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="alertQuantity">{t("تنبيه عند الكمية", "Alert Quantity")}</Label>
                      <Input
                        id="alertQuantity"
                        type="number"
                        min="0"
                        value={formData.alertQuantity}
                        onChange={(e) => setFormData({ ...formData, alertQuantity: e.target.value })}
                        placeholder="5"
                        className="h-12 bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  {/* Status Toggles */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <Check className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {productType === "outfit"
                              ? t("الطقم نشط", "Outfit Active")
                              : t("المنتج نشط", "Product Active")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {productType === "outfit"
                              ? t("سيظهر الطقم في المتجر", "Outfit will appear in store")
                              : t("سيظهر المنتج في المتجر", "Product will appear in store")}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                          <Star className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {productType === "outfit"
                              ? t("طقم مميز", "Featured Outfit")
                              : t("منتج مميز", "Featured Product")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t("سيظهر في قسم المنتجات المميزة", "Will appear in featured section")}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.isFeatured}
                        onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                      />
                    </div>
                  </div>

                  {/* Outfit Summary */}
                  {productType === "outfit" && outfitItems.length > 0 && (
                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                      <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                        <Layers className="w-5 h-5" />
                        {t("ملخص الطقم", "Outfit Summary")}
                      </h3>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="text-muted-foreground">{t("عدد القطع:", "Number of pieces:")}</span>{" "}
                          <span className="font-medium">{outfitItems.length}</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">{t("نوع المقاس:", "Size type:")}</span>{" "}
                          <span className="font-medium">
                            {outfitSizeType === "unified" ? t("موحد", "Unified") : t("لكل قطعة", "Per piece")}
                          </span>
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {outfitItems.map((item, index) => (
                            <span key={index} className="px-3 py-1 bg-background rounded-full text-xs font-medium">
                              {language === "ar" ? item.nameAr || item.type : item.nameEn || item.type}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handlePreviousSection(getSectionIndex("pricing"))}
                    className="gap-2 bg-transparent"
                  >
                    <ArrowRight className="w-4 h-4" />
                    {t("السابق", "Previous")}
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1 h-14 text-lg font-semibold gap-2">
                    {loading ? (
                      <>
                        <Sparkles className="w-5 h-5 animate-spin" />
                        {t("جاري الإضافة...", "Adding...")}
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        {productType === "outfit" ? t("إضافة الطقم", "Add Outfit") : t("إضافة المنتج", "Add Product")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {activeSection === getSectionIndex("similarProducts") && (
              <div className="bg-background rounded-2xl border p-6 animate-slide-up">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      {t("منتجات مشابهة ومكملة", "Similar & Complementary Products")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t("أضف تاجات واختر منتجات مشابهة", "Add tags and select related products")}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Tags Input */}
                  <div className="space-y-2">
                    <Label htmlFor="tags" className="flex items-center gap-2">
                      {t("التاجات (كلمات مفتاحية)", "Tags (Keywords)")}
                      <span className="text-xs text-muted-foreground">
                        {t("كل تاج في سطر منفصل", "One tag per line")}
                      </span>
                    </Label>
                    <Textarea
                      id="tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder={t(
                        "مثال:\nقميص\nرسمي\nقطن\nأزرق\nصيف",
                        "Example:\nshirt\nformal\ncotton\nblue\nsummer",
                      )}
                      rows={5}
                      className="bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20 resize-none font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t(
                        "هذه التاجات تستخدم لعرض منتجات مشابهة تلقائياً",
                        "These tags are used to show similar products automatically",
                      )}
                    </p>
                  </div>

                  {/* Related Products Selection */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      {t("اختر منتجات مشابهة يدوياً", "Select Related Products Manually")}
                      <span className="text-xs text-muted-foreground">
                        ({relatedProductIds.length} {t("محدد", "selected")})
                      </span>
                    </Label>

                    {loadingProducts ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-3 bg-muted/30 rounded-xl">
                        {allProducts.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => toggleRelatedProduct(product.id)}
                            className={cn(
                              "relative group flex flex-col gap-2 p-3 rounded-xl border-2 transition-all duration-200",
                              relatedProductIds.includes(product.id)
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-primary/50 bg-background",
                            )}
                          >
                            {relatedProductIds.includes(product.id) && (
                              <div className="absolute top-2 end-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-3 h-3 text-primary-foreground" />
                              </div>
                            )}
                            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                              <Image
                                src={product.mainImage || "/placeholder.svg?height=100&width=100"}
                                alt={language === "ar" ? product.nameAr : product.nameEn}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="text-start">
                              <p className="text-xs font-medium text-foreground line-clamp-2">
                                {language === "ar" ? product.nameAr : product.nameEn}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {product.discountedPrice.toFixed(0)} {t("ج.م", "EGP")}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      {t(
                        "هذه المنتجات ستظهر مباشرة في قسم 'منتجات مشابهة' في صفحة تفاصيل المنتج",
                        "These products will appear directly in the 'Similar Products' section on the product details page",
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handlePreviousSection(productType === "outfit" ? 7 : 6)}
                    className="gap-2 bg-transparent"
                  >
                    <ArrowRight className="w-4 h-4" />
                    {t("السابق", "Previous")}
                  </Button>
                  <Button type="submit" disabled={loading} className="gap-2">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {t("حفظ المنتج", "Save Product")}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
