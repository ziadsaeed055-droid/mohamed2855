"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CreditCard, Truck, CheckCircle } from "lucide-react"
import type { Address } from "@/lib/types"
import { sendOrderConfirmationNotification } from "@/lib/notification-service"

export default function CheckoutPage() {
  // Scroll to top on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0)
    }
  }, [])

  const router = useRouter()
  const { items, getTotal, clearCart } = useCart()
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])
  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
    notes: "",
  })
  const [paymentMethod, setPaymentMethod] = useState("cod")

  useEffect(() => {
    if (user?.savedAddresses && user.savedAddresses.length > 0) {
      setSavedAddresses(user.savedAddresses)
      const defaultAddress = user.savedAddresses.find((addr) => addr.isDefault)
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id)
        setFormData((prev) => ({
          ...prev,
          phone: defaultAddress.phone,
          address: defaultAddress.street,
          city: defaultAddress.city,
        }))
      }
    }
  }, [user?.savedAddresses])

  const handleSelectSavedAddress = (address: Address) => {
    setSelectedAddressId(address.id)
    setFormData((prev) => ({
      ...prev,
      phone: address.phone,
      address: address.street,
      city: address.city,
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setSelectedAddressId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return

    setLoading(true)
    console.log("[v0] ===== CHECKOUT PROCESS STARTED =====")
    console.log("[v0] User ID:", user?.id)
    console.log("[v0] Items count:", items.length)
    console.log("[v0] Total:", getTotal())

    try {
      const orderData = {
        userId: user?.id || "guest",
        userEmail: formData.email,
        userName: formData.name,
        userPhone: formData.phone,
        userAddress: `${formData.address}, ${formData.city}`,
        items: items.map((item) => ({
          productId: item.productId,
          productNameAr: item.product.nameAr,
          productNameEn: item.product.nameEn,
          quantity: item.quantity,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
          price: item.product.discount > 0 ? item.product.discountedPrice : item.product.salePrice,
          mainImage: item.product.mainImage,
        })),
        subtotal: getTotal(),
        tax: 0,
        total: getTotal(),
        status: "pending",
        paymentMethod,
        notes: formData.notes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      console.log("[v0] Creating order in Firebase...")
      const orderRef = await addDoc(collection(db, "orders"), orderData)
      const orderId = orderRef.id
      console.log("[v0] Order created successfully with ID:", orderId)

      if (user?.id && user.id !== "guest") {
        console.log("[v0] Sending order confirmation notification...")
        try {
          console.log("[v0] Notification parameters:", {
            userId: user.id,
            orderId,
            total: getTotal(),
            itemCount: items.length,
          })
          await sendOrderConfirmationNotification(user.id, orderId, getTotal(), items.length)
          console.log("[v0] ✓ Order confirmation notification sent successfully")
        } catch (notificationError) {
          console.error("[v0] ✗ Failed to send order notification:", notificationError)
        }
      } else {
        console.log("[v0] Guest user - skipping notification")
      }

      toast({
        title: t("تم الطلب بنجاح!", "Order Placed Successfully!"),
        description: t("سيتم التواصل معك قريباً", "We will contact you soon"),
      })

      console.log("[v0] Clearing cart and redirecting...")
      clearCart()
      router.push("/order-success")
      console.log("[v0] ===== CHECKOUT PROCESS COMPLETED =====")
    } catch (error) {
      console.error("[v0] ✗ Error placing order:", error)
      toast({
        title: t("حدث خطأ", "Error"),
        description: t("فشل في إتمام الطلب. حاول مرة أخرى", "Failed to place order. Please try again"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    router.push("/cart")
    return null
  }

  const addressLabels = {
    Home: { ar: "المنزل", en: "Home" },
    Work: { ar: "العمل", en: "Work" },
    Other: { ar: "آخر", en: "Other" },
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <Header />

      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 animate-slide-up">{t("إتمام الشراء", "Checkout")}</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Saved Addresses */}
                {savedAddresses.length > 0 && (
                  <div className="bg-card rounded-xl border p-6 space-y-4 animate-scale-in">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">
                        1
                      </span>
                      {t("العناوين المحفوظة", "Saved Addresses")}
                    </h2>

                    <div className="grid md:grid-cols-2 gap-3">
                      {savedAddresses.map((address) => (
                        <Card
                          key={address.id}
                          className={`p-3 border-2 cursor-pointer transition-all ${
                            selectedAddressId === address.id
                              ? "border-primary/50 bg-primary/5"
                              : "border-border hover:border-primary/30"
                          }`}
                          onClick={() => handleSelectSavedAddress(address)}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              checked={selectedAddressId === address.id}
                              onChange={() => handleSelectSavedAddress(address)}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">
                                {addressLabels[address.label as keyof typeof addressLabels][language]}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1">{address.street}</p>
                              <p className="text-xs text-muted-foreground">{address.city}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="bg-card rounded-xl border p-6 space-y-6 animate-scale-in">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">
                      {savedAddresses.length > 0 ? "2" : "1"}
                    </span>
                    {t("معلومات التواصل", "Contact Information")}
                  </h2>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("الاسم الكامل", "Full Name")} *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder={t("محمد أحمد", "John Doe")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("البريد الإلكتروني", "Email")} *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="phone">{t("رقم الهاتف", "Phone Number")} *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="+20 123 456 7890"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-card rounded-xl border p-6 space-y-6 animate-scale-in animation-delay-100">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">
                      {savedAddresses.length > 0 ? "3" : "2"}
                    </span>
                    {t("عنوان الشحن", "Shipping Address")}
                  </h2>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">{t("العنوان التفصيلي", "Full Address")} *</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        placeholder={t("الشارع، المبنى، الشقة", "Street, Building, Apartment")}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">{t("المدينة", "City")} *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        placeholder={t("القاهرة", "Cairo")}
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-card rounded-xl border p-6 space-y-6 animate-scale-in animation-delay-200">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">
                      {savedAddresses.length > 0 ? "4" : "3"}
                    </span>
                    {t("طريقة الدفع", "Payment Method")}
                  </h2>

                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                    <div className="flex items-center space-x-4 space-x-reverse p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                        <Truck className="h-6 w-6 text-primary" />
                        <div>
                          <p className="font-medium">{t("الدفع عند الاستلام", "Cash on Delivery")}</p>
                          <p className="text-sm text-muted-foreground">
                            {t("ادفع عند استلام طلبك", "Pay when you receive your order")}
                          </p>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-4 space-x-reverse p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer opacity-50">
                      <RadioGroupItem value="card" id="card" disabled />
                      <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                        <CreditCard className="h-6 w-6 text-primary" />
                        <div>
                          <p className="font-medium">{t("بطاقة ائتمان", "Credit Card")}</p>
                          <p className="text-sm text-muted-foreground">{t("قريباً", "Coming Soon")}</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Notes */}
                <div className="bg-card rounded-xl border p-6 space-y-4 animate-scale-in animation-delay-300">
                  <Label htmlFor="notes">{t("ملاحظات إضافية", "Additional Notes")}</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder={t("أي ملاحظات خاصة بالطلب", "Any special notes for your order")}
                    rows={3}
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-28 bg-card rounded-xl border p-6 space-y-6 animate-slide-in-right">
                  <h2 className="text-xl font-bold">{t("ملخص الطلب", "Order Summary")}</h2>

                  {/* Items */}
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {items.map((item) => {
                      const name = language === "ar" ? item.product.nameAr : item.product.nameEn
                      const price = item.product.discount > 0 ? item.product.discountedPrice : item.product.salePrice

                      return (
                        <div
                          key={`${item.productId}-${item.selectedColor}-${item.selectedSize}`}
                          className="flex gap-3"
                        >
                          <div className="relative w-16 h-16 flex-shrink-0">
                            <Image
                              src={item.product.mainImage || "/placeholder.svg?height=64&width=64&query=clothing"}
                              alt={name}
                              fill
                              className="object-cover rounded-lg"
                            />
                            <span className="absolute -top-2 -end-2 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">{name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.selectedSize} / {item.selectedColor}
                            </p>
                            <p className="text-sm font-medium text-primary">
                              {(price * item.quantity).toFixed(2)} {t("ج.م", "EGP")}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="border-t pt-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("المجموع الفرعي", "Subtotal")}</span>
                      <span>
                        {getTotal().toFixed(2)} {t("ج.م", "EGP")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("الشحن", "Shipping")}</span>
                      <span className="text-green-600">{t("مجاني", "Free")}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>{t("الإجمالي", "Total")}</span>
                      <span className="text-primary">
                        {getTotal().toFixed(2)} {t("ج.م", "EGP")}
                      </span>
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 me-2 animate-spin" />
                        {t("جاري التأكيد...", "Processing...")}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 me-2" />
                        {t("تأكيد الطلب", "Confirm Order")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  )
}
