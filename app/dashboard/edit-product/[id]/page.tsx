"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import { CATEGORIES, COLORS, SIZES } from "@/lib/types"
import type { Product } from "@/lib/types"
import {
  ArrowRight,
  ArrowLeft,
  Upload,
  X,
  Home,
  Loader2,
  Package,
  DollarSign,
  Palette,
  ImageIcon,
  Tag,
  FileText,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function EditProductPage() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const { t, language } = useLanguage()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [activeSection, setActiveSection] = useState(0)
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

  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [mainImage, setMainImage] = useState("")
  const [additionalImages, setAdditionalImages] = useState<string[]>([])
  const [colorImages, setColorImages] = useState<{ [colorId: string]: string }>({})

  const BackArrow = language === "ar" ? ArrowRight : ArrowLeft

  const costPrice = Number.parseFloat(formData.costPrice) || 0
  const salePrice = Number.parseFloat(formData.salePrice) || 0
  const discount = Number.parseFloat(formData.discount) || 0
  const profit = salePrice - costPrice
  const discountedPrice = salePrice - (salePrice * discount) / 100

  const sections = [
    { id: 0, icon: FileText, label: t("المعلومات الأساسية", "Basic Info") },
    { id: 1, icon: Tag, label: t("التصنيف", "Category") },
    { id: 2, icon: Palette, label: t("الألوان والمقاسات", "Colors & Sizes") },
    { id: 3, icon: ImageIcon, label: t("الصور", "Images") },
    { id: 4, icon: DollarSign, label: t("التسعير", "Pricing") },
    { id: 5, icon: Package, label: t("المخزون والحالة", "Stock & Status") },
  ]

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", productId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const product = docSnap.data() as Product
          setFormData({
            productCode: product.productCode || "",
            nameAr: product.nameAr,
            nameEn: product.nameEn,
            descriptionAr: product.descriptionAr,
            descriptionEn: product.descriptionEn,
            featuresAr: product.featuresAr.join("\n"),
            featuresEn: product.featuresEn.join("\n"),
            notesAr: product.notesAr,
            notesEn: product.notesEn,
            afterPurchaseNotesAr: product.afterPurchaseNotesAr,
            afterPurchaseNotesEn: product.afterPurchaseNotesEn,
            category: product.category,
            subCategory: product.subCategory,
            costPrice: product.costPrice.toString(),
            salePrice: product.salePrice.toString(),
            discount: product.discount.toString(),
            quantity: product.quantity.toString(),
            alertQuantity: product.alertQuantity.toString(),
            tax: product.tax.toString(),
            isActive: product.isActive,
            isFeatured: product.isFeatured,
          })
          setSelectedColors(product.colors)
          setSelectedSizes(product.sizes)
          setMainImage(product.mainImage)
          setAdditionalImages(product.additionalImages || [])
          setColorImages(product.colorImages || {})
        } else {
          toast({
            title: t("خطأ", "Error"),
            description: t("المنتج غير موجود", "Product not found"),
            variant: "destructive",
          })
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        toast({
          title: t("خطأ", "Error"),
          description: t("فشل في تحميل المنتج", "Failed to load product"),
          variant: "destructive",
        })
      } finally {
        setFetching(false)
      }
    }

    fetchProduct()
  }, [productId, router, toast, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nameAr || !formData.nameEn || !formData.category || !formData.subCategory || !salePrice) {
      toast({
        title: t("خطأ", "Error"),
        description: t("يرجى ملء جميع الحقول المطلوبة بما فيها القسم والفئة", "Please fill all required fields including category and subcategory"),
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const productData = {
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
        isFeatured: formData.isFeatured,
        updatedAt: serverTimestamp(),
      }

      await updateDoc(doc(db, "products", productId), productData)

      toast({
        title: t("تم التحديث", "Updated"),
        description: t("تم تحديث المنتج بنجاح", "Product updated successfully"),
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: t("خطأ", "Error"),
        description: t("فشل في تحديث المنتج", "Failed to update product"),
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

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-muted animate-pulse" />
            <Loader2 className="w-8 h-8 absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground font-medium">{t("جاري تحميل المنتج...", "Loading product...")}</p>
        </div>
      </div>
    )
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
                  <h1 className="text-lg font-bold text-foreground">{t("تعديل المنتج", "Edit Product")}</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {language === "ar" ? formData.nameAr : formData.nameEn}
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
                </button>
              ))}
            </div>
          </aside>

          {/* Main Form - Same structure as add-product but with pre-filled data */}
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

            {/* Section 0: Basic Info */}
            {activeSection === 0 && (
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
                      {t("اسم ووصف المنتج", "Product name and description")}
                    </p>
                  </div>
                </div>

                {/* Product Code - Read Only */}
                {formData.productCode && (
                  <div className="mb-6 p-4 bg-muted/30 rounded-xl border border-dashed">
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      {t("كود المنتج", "Product Code")}
                    </Label>
                    <p className="font-mono text-lg font-bold tracking-wider text-foreground">
                      {formData.productCode}
                    </p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nameAr" className="flex items-center gap-2">
                      {t("اسم المنتج (عربي)", "Product Name (Arabic)")}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nameAr"
                      value={formData.nameAr}
                      onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                      className="h-12 bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameEn" className="flex items-center gap-2">
                      {t("اسم المنتج (إنجليزي)", "Product Name (English)")}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nameEn"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="featuresAr">{t("المميزات (عربي)", "Features (Arabic)")}</Label>
                    <Textarea
                      id="featuresAr"
                      value={formData.featuresAr}
                      onChange={(e) => setFormData({ ...formData, featuresAr: e.target.value })}
                      rows={3}
                      className="bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20 resize-none"
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
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button type="button" onClick={() => setActiveSection(1)} className="gap-2">
                    {t("التالي", "Next")}
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Section 1-5: Same as add-product - using similar structure */}
            {activeSection === 1 && (
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
                    onClick={() => setActiveSection(0)}
                    className="gap-2 bg-transparent"
                  >
                    <ArrowRight className="w-4 h-4" />
                    {t("السابق", "Previous")}
                  </Button>
                  <Button type="button" onClick={() => setActiveSection(2)} className="gap-2">
                    {t("التالي", "Next")}
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {activeSection === 2 && (
              <div className="bg-background rounded-2xl border p-6 animate-slide-up">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{t("الألوان والمقاسات", "Colors & Sizes")}</h2>
                    <p className="text-sm text-muted-foreground">
                      {t("الألوان والمقاسات المتاحة", "Available colors and sizes")}
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">{t("الألوان المتاحة", "Available Colors")}</Label>
                    <div className="flex flex-wrap gap-3">
                      {COLORS.map((color) => (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => {
                            if (selectedColors.includes(color.hex)) {
                              setSelectedColors(selectedColors.filter((c) => c !== color.hex))
                            } else {
                              setSelectedColors([...selectedColors, color.hex])
                            }
                          }}
                          className={cn(
                            "w-12 h-12 rounded-xl border-2 transition-all duration-300 flex items-center justify-center hover:scale-110",
                            selectedColors.includes(color.hex)
                              ? "border-primary ring-4 ring-primary/20 scale-110"
                              : "border-transparent hover:border-muted-foreground/30",
                          )}
                          style={{ backgroundColor: color.hex }}
                          title={t(color.nameAr, color.nameEn)}
                        >
                          {selectedColors.includes(color.hex) && (
                            <Check
                              className={cn("w-5 h-5", color.hex === "#FFFFFF" ? "text-foreground" : "text-white")}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">{t("المقاسات المتاحة", "Available Sizes")}</Label>
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
                              : "border-border bg-muted/50 hover:border-primary text-foreground",
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
                    onClick={() => setActiveSection(1)}
                    className="gap-2 bg-transparent"
                  >
                    <ArrowRight className="w-4 h-4" />
                    {t("السابق", "Previous")}
                  </Button>
                  <Button type="button" onClick={() => setActiveSection(3)} className="gap-2">
                    {t("التالي", "Next")}
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {activeSection === 3 && (
              <div className="bg-background rounded-2xl border p-6 animate-slide-up">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{t("صور المنتج", "Product Images")}</h2>
                    <p className="text-sm text-muted-foreground">{t("صور المنتج", "Product images")}</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">{t("الصورة الرئيسية", "Main Image")}</Label>
                    <div className="flex items-start gap-4">
                      {mainImage ? (
                        <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-2 border-primary">
                          <Image src={mainImage || "/placeholder.svg"} alt="Main" fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => setMainImage("")}
                            className="absolute top-2 end-2 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:scale-110"
                          >
                            <X className="h-4 w-4" />
                          </button>
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

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">{t("صور إضافية", "Additional Images")}</Label>
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
                            className="absolute top-2 end-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
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

                  {/* Color-specific Images */}
                  {selectedColors.length > 0 && (
                    <div className="space-y-4 pt-6 border-t">
                      <div className="flex items-start justify-between">
                        <div>
                          <Label className="text-base font-semibold block mb-2">
                            {t("صور خاصة بالألوان (اختياري)", "Color-Specific Images (Optional)")}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {t(
                              "رفع صور مختلفة لكل لون",
                              "Upload different images for each color",
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4">
                        {selectedColors.map((colorHex) => {
                          const color = COLORS.find((c) => c.hex === colorHex)
                          return (
                            <div key={colorHex} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                              <div
                                className="w-12 h-12 rounded-lg border-2 flex-shrink-0"
                                style={{ backgroundColor: colorHex }}
                              />
                              <div className="flex-1 min-w-0">
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
                    onClick={() => setActiveSection(2)}
                    className="gap-2 bg-transparent"
                  >
                    <ArrowRight className="w-4 h-4" />
                    {t("السابق", "Previous")}
                  </Button>
                  <Button type="button" onClick={() => setActiveSection(4)} className="gap-2">
                    {t("التالي", "Next")}
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {activeSection === 4 && (
              <div className="bg-background rounded-2xl border p-6 animate-slide-up">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{t("التسعير", "Pricing")}</h2>
                    <p className="text-sm text-muted-foreground">{t("أسعار المنتج", "Product pricing")}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="costPrice">{t("سعر الشراء", "Cost Price")}</Label>
                    <Input
                      id="costPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                      className="h-12 bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salePrice">{t("سعر البيع", "Sale Price")} *</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                      className="h-12 bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                      required
                    />
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
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      className="h-12 bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("السعر بعد الخصم", "After Discount")}</Label>
                    <div className="h-12 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-lg text-primary">
                      {discountedPrice.toFixed(2)} {t("ج.م", "EGP")}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax">{t("الضريبة", "Tax")}</Label>
                    <Input
                      id="tax"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.tax}
                      onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                      className="h-12 bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveSection(3)}
                    className="gap-2 bg-transparent"
                  >
                    <ArrowRight className="w-4 h-4" />
                    {t("السابق", "Previous")}
                  </Button>
                  <Button type="button" onClick={() => setActiveSection(5)} className="gap-2">
                    {t("التالي", "Next")}
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {activeSection === 5 && (
              <div className="bg-background rounded-2xl border p-6 animate-slide-up">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{t("المخزون والحالة", "Stock & Status")}</h2>
                    <p className="text-sm text-muted-foreground">
                      {t("إدارة المخزون والحالة", "Manage stock and status")}
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">{t("الكمية المتاحة", "Quantity")}</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="0"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
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
                        className="h-12 bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">{t("حالة المنتج", "Product Status")}</Label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                        className={cn(
                          "p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all duration-300",
                          formData.isActive
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                            : "border-border hover:border-muted-foreground/30",
                        )}
                      >
                        <div
                          className={cn(
                            "w-14 h-14 rounded-xl flex items-center justify-center",
                            formData.isActive ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground",
                          )}
                        >
                          <Check className="w-7 h-7" />
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-foreground">{t("منتج نشط", "Active Product")}</p>
                          <p className="text-sm text-muted-foreground">{t("يظهر للمستخدمين", "Visible to users")}</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                        className={cn(
                          "p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all duration-300",
                          formData.isFeatured
                            ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10"
                            : "border-border hover:border-muted-foreground/30",
                        )}
                      >
                        <div
                          className={cn(
                            "w-14 h-14 rounded-xl flex items-center justify-center",
                            formData.isFeatured ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground",
                          )}
                        >
                          <Tag className="w-7 h-7" />
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-foreground">{t("منتج مميز", "Featured Product")}</p>
                          <p className="text-sm text-muted-foreground">
                            {t("يظهر في الصفحة الرئيسية", "Shows on homepage")}
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveSection(4)}
                    className="gap-2 bg-transparent"
                  >
                    <ArrowRight className="w-4 h-4" />
                    {t("السابق", "Previous")}
                  </Button>
                  <Button type="submit" disabled={loading} className="gap-2 min-w-[180px] h-12 text-base font-semibold">
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {t("جاري الحفظ...", "Saving...")}
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
                        {t("حفظ التعديلات", "Save Changes")}
                      </>
                    )}
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
