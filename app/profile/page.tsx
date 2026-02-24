"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { SavedAddressesImproved } from "@/components/saved-addresses-improved"
import { ProfileNotificationsTab } from "@/components/profile-notifications-tab"
import { ProfileRewardsTab } from "@/components/profile-rewards-tab"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import { useLoyalty } from "@/contexts/loyalty-context"
import type { Order, Address } from "@/lib/types"
import {
  User,
  Package,
  LogOut,
  Loader2,
  Edit2,
  Save,
  MapPin,
  Bell,
  ShoppingBag,
  Mail,
  Phone,
  Building2,
  MapPinned,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  ChevronRight,
  ChevronLeft,
  Crown,
  Calendar,
  CreditCard,
  Shield,
  Sparkles,
  Gift,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ChatWidget } from "@/components/chat-widget"

const statusConfig = {
  pending: {
    color: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
    icon: Clock,
    gradient: "from-amber-500 to-orange-500",
  },
  processing: {
    color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
    icon: Package,
    gradient: "from-blue-500 to-cyan-500",
  },
  shipped: {
    color: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400",
    icon: Truck,
    gradient: "from-indigo-500 to-purple-500",
  },
  delivered: {
    color: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: PackageCheck,
    gradient: "from-emerald-500 to-teal-500",
  },
}

const statusLabels = {
  pending: { ar: "قيد الانتظار", en: "Pending" },
  processing: { ar: "جاري التنفيذ", en: "Processing" },
  shipped: { ar: "تم الشحن", en: "Shipped" },
  delivered: { ar: "تم التسليم", en: "Delivered" },
}

export default function ProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, firebaseUser, signOut, updateUserProfile, loading: authLoading } = useAuth()

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  const { t, language } = useLanguage()
  const { toast } = useToast()
  const { loyaltyData } = useLoyalty()

  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [addressLoading, setAddressLoading] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])
  const [profileData, setProfileData] = useState({
    displayName: "",
    phone: "",
    address: "",
    city: "",
  })
  const [activeTab, setActiveTab] = useState("profile")

  const Arrow = language === "ar" ? ChevronLeft : ChevronRight

  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.push("/auth")
    }
  }, [authLoading, firebaseUser, router])

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["profile", "addresses", "notifications", "orders", "rewards"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    if (user) {
      setProfileData({
        displayName: user.displayName || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
      })
      setSavedAddresses(user.savedAddresses || [])
    }
  }, [user])

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return

      try {
        const q = query(collection(db, "orders"), where("userId", "==", user.id))
        const snapshot = await getDocs(q)

        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[]

        ordersData.sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : a.createdAt
          const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : b.createdAt
          return dateB - dateA
        })

        setOrders(ordersData)
      } catch (error) {
        console.error("Error fetching orders:", error)
        setOrders([])
      } finally {
        setOrdersLoading(false)
      }
    }

    fetchOrders()
  }, [user?.id])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await updateUserProfile(profileData)
      setIsEditing(false)
      toast({
        title: t("تم الحفظ", "Saved"),
        description: t("تم تحديث بياناتك بنجاح", "Your profile has been updated"),
      })
    } catch (error) {
      toast({
        title: t("خطأ", "Error"),
        description: t("فشل في حفظ البيانات", "Failed to save data"),
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAddAddress = async (address: Address) => {
    setAddressLoading(true)
    try {
      const updatedAddresses = [...savedAddresses, address]
      if (address.isDefault || savedAddresses.length === 0) {
        updatedAddresses.forEach((addr) => {
          addr.isDefault = addr.id === address.id
        })
      }
      setSavedAddresses(updatedAddresses)
      await updateUserProfile({ savedAddresses: updatedAddresses })
      toast({
        title: t("تم الإضافة", "Added"),
        description: t("تم إضافة العنوان بنجاح", "Address added successfully"),
      })
    } catch (error) {
      toast({
        title: t("خطأ", "Error"),
        description: t("فشل في إضافة العنوان", "Failed to add address"),
        variant: "destructive",
      })
    } finally {
      setAddressLoading(false)
    }
  }

  const handleUpdateAddress = async (id: string, updates: Partial<Address>) => {
    setAddressLoading(true)
    try {
      const updatedAddresses = savedAddresses.map((addr) => (addr.id === id ? { ...addr, ...updates } : addr))
      if (updates.isDefault) {
        updatedAddresses.forEach((addr) => {
          addr.isDefault = addr.id === id
        })
      }
      setSavedAddresses(updatedAddresses)
      await updateUserProfile({ savedAddresses: updatedAddresses })
      toast({
        title: t("تم التحديث", "Updated"),
        description: t("تم تحديث العنوان بنجاح", "Address updated successfully"),
      })
    } catch (error) {
      toast({
        title: t("خطأ", "Error"),
        variant: "destructive",
      })
    } finally {
      setAddressLoading(false)
    }
  }

  const handleDeleteAddress = async (id: string) => {
    setAddressLoading(true)
    try {
      const updatedAddresses = savedAddresses.filter((addr) => addr.id !== id)
      if (savedAddresses.find((addr) => addr.id === id)?.isDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true
      }
      setSavedAddresses(updatedAddresses)
      await updateUserProfile({ savedAddresses: updatedAddresses })
      toast({
        title: t("تم الحذف", "Deleted"),
        description: t("تم حذف العنوان بنجاح", "Address deleted successfully"),
      })
    } catch (error) {
      toast({
        title: t("خطأ", "Error"),
        description: t("فشل في حذف العنوان", "Failed to delete address"),
        variant: "destructive",
      })
    } finally {
      setAddressLoading(false)
    }
  }

  const handleSelectDefault = async (id: string) => {
    setAddressLoading(true)
    try {
      const updatedAddresses = savedAddresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
      setSavedAddresses(updatedAddresses)
      await updateUserProfile({ savedAddresses: updatedAddresses })
    } catch (error) {
      toast({
        title: t("خطأ", "Error"),
        variant: "destructive",
      })
    } finally {
      setAddressLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-primary/20 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
          <p className="text-muted-foreground font-medium">{t("جاري التحميل...", "Loading...")}</p>
        </div>
      </div>
    )
  }

  const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0)

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <section className="relative pt-16">
        <div className="relative h-56 md:h-72 overflow-hidden">
          <Image src="/images/image.png" alt="Seven Blue Banner" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a365d]/30 via-[#1a365d]/50 to-slate-50" />
        </div>

        {/* Profile Card Overlapping Banner */}
        <div className="container mx-auto px-4 -mt-20 md:-mt-24 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">
              {/* Profile Header */}
              <div className="p-6 md:p-8 pt-8 md:pt-10">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-br from-[#1a365d] via-[#2d4a7c] to-[#4a6fa5] rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                    <div className="relative bg-white p-2 rounded-full">
                      {user.photoURL ? (
                        <Image
                          src={user.photoURL || "/placeholder.svg"}
                          alt={user.displayName || "User"}
                          width={140}
                          height={140}
                          className="relative rounded-full ring-4 ring-white shadow-xl"
                        />
                      ) : (
                        <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-[#1a365d] to-[#2d4a7c] flex items-center justify-center shadow-xl">
                          <User className="h-16 w-16 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -end-1 w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center ring-4 ring-white shadow-lg">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 text-center md:text-start space-y-3">
                    <div className="flex flex-col md:flex-row items-center gap-3">
                      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                        {user.displayName || t("مستخدم", "User")}
                      </h1>
                      {loyaltyData ? (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1.5 px-3 py-1">
                          <Crown className="w-3.5 h-3.5" />
                          {language === "ar"
                            ? loyaltyData.currentTier === "A"
                              ? "المستوى الذهبي"
                              : loyaltyData.currentTier === "B"
                                ? "المستوى الفضي"
                                : "المستوى البرونزي"
                            : loyaltyData.currentTier === "A"
                              ? "Gold Tier"
                              : loyaltyData.currentTier === "B"
                                ? "Silver Tier"
                                : "Bronze Tier"}
                        </Badge>
                      ) : (
                        <Badge className="bg-[#1a365d]/10 text-[#1a365d] border-[#1a365d]/20 gap-1.5 px-3 py-1">
                          <Crown className="w-3.5 h-3.5" />
                          {t("عضو مميز", "Premium Member")}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </span>
                      {profileData.phone && (
                        <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
                          <Phone className="w-4 h-4" />
                          {profileData.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sign Out Button */}
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 bg-transparent rounded-xl"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("تسجيل الخروج", "Sign Out")}</span>
                  </Button>
                </div>

                {/* Stats Cards - Added points stat */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 pt-6 border-t">
                  {[
                    {
                      icon: ShoppingBag,
                      value: orders.length,
                      label: t("إجمالي الطلبات", "Total Orders"),
                      color: "blue",
                    },
                    {
                      icon: PackageCheck,
                      value: orders.filter((o) => o.status === "delivered").length,
                      label: t("طلبات مكتملة", "Completed"),
                      color: "emerald",
                    },
                    {
                      icon: CreditCard,
                      value: `${totalSpent.toFixed(0)}`,
                      suffix: t("ج.م", "EGP"),
                      label: t("إجمالي المصروفات", "Total Spent"),
                      color: "amber",
                    },
                    {
                      icon: Star,
                      value: loyaltyData?.totalPoints || 0,
                      label: t("رصيد النقاط", "Points Balance"),
                      color: "purple",
                    },
                    {
                      icon: MapPin,
                      value: savedAddresses.length,
                      label: t("عناوين محفوظة", "Saved Addresses"),
                      color: "indigo",
                    },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className={cn(
                        "text-center p-4 rounded-2xl border transition-all hover:shadow-md",
                        stat.color === "blue" && "bg-blue-50 border-blue-100",
                        stat.color === "emerald" && "bg-emerald-50 border-emerald-100",
                        stat.color === "amber" && "bg-amber-50 border-amber-100",
                        stat.color === "indigo" && "bg-indigo-50 border-indigo-100",
                        stat.color === "purple" && "bg-purple-50 border-purple-100",
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center",
                          stat.color === "blue" && "bg-blue-200/50",
                          stat.color === "emerald" && "bg-emerald-200/50",
                          stat.color === "amber" && "bg-amber-200/50",
                          stat.color === "indigo" && "bg-indigo-200/50",
                          stat.color === "purple" && "bg-purple-200/50",
                        )}
                      >
                        <stat.icon
                          className={cn(
                            "w-5 h-5",
                            stat.color === "blue" && "text-blue-600",
                            stat.color === "emerald" && "text-emerald-600",
                            stat.color === "amber" && "text-amber-600",
                            stat.color === "indigo" && "text-indigo-600",
                            stat.color === "purple" && "text-purple-600",
                          )}
                        />
                      </div>
                      <p className="text-2xl font-bold text-slate-900">
                        {stat.value}
                        {stat.suffix && <span className="text-sm font-normal text-slate-500 ms-1">{stat.suffix}</span>}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section - Added rewards tab */}
      <section className="py-8 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-slide-up">
              <TabsList className="w-full h-auto p-1.5 bg-white rounded-2xl border shadow-sm mb-8 grid grid-cols-5 gap-1">
                {[
                  { value: "profile", icon: User, label: t("البيانات الشخصية", "Profile") },
                  { value: "rewards", icon: Gift, label: t("المكافآت", "Rewards") },
                  { value: "addresses", icon: MapPin, label: t("العناوين", "Addresses") },
                  { value: "notifications", icon: Bell, label: t("الإشعارات", "Notifications") },
                  { value: "orders", icon: Package, label: t("طلباتي", "My Orders") },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="data-[state=active]:bg-[#1a365d] data-[state=active]:text-white data-[state=active]:shadow-md rounded-xl py-3 px-4 gap-2 transition-all duration-300"
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden sm:inline font-medium">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="mt-0">
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                  <div className="p-6 border-b bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#1a365d]/10 flex items-center justify-center">
                          <Shield className="w-6 h-6 text-[#1a365d]" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">
                            {t("البيانات الشخصية", "Personal Information")}
                          </h2>
                          <p className="text-sm text-slate-500">
                            {t("إدارة معلوماتك الشخصية", "Manage your personal information")}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={isEditing ? "default" : "outline"}
                        onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
                        disabled={saving}
                        className={cn(
                          "gap-2 rounded-xl transition-all duration-300",
                          isEditing ? "bg-[#1a365d] hover:bg-[#1a365d]/90" : "bg-transparent",
                        )}
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isEditing ? (
                          <>
                            <Save className="h-4 w-4" />
                            {t("حفظ التغييرات", "Save Changes")}
                          </>
                        ) : (
                          <>
                            <Edit2 className="h-4 w-4" />
                            {t("تعديل", "Edit")}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-slate-600 font-medium">
                          <User className="w-4 h-4" />
                          {t("الاسم الكامل", "Full Name")}
                        </Label>
                        <Input
                          value={profileData.displayName}
                          onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                          disabled={!isEditing}
                          className={cn(
                            "h-12 rounded-xl transition-all duration-300",
                            isEditing
                              ? "bg-white border-[#1a365d]/30 focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d]"
                              : "bg-slate-50 border-slate-200",
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-slate-600 font-medium">
                          <Mail className="w-4 h-4" />
                          {t("البريد الإلكتروني", "Email")}
                        </Label>
                        <Input
                          value={user.email || ""}
                          disabled
                          className="h-12 rounded-xl bg-slate-50 border-slate-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-slate-600 font-medium">
                          <Phone className="w-4 h-4" />
                          {t("رقم الهاتف", "Phone")}
                        </Label>
                        <Input
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          disabled={!isEditing}
                          className={cn(
                            "h-12 rounded-xl transition-all duration-300",
                            isEditing
                              ? "bg-white border-[#1a365d]/30 focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d]"
                              : "bg-slate-50 border-slate-200",
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-slate-600 font-medium">
                          <Building2 className="w-4 h-4" />
                          {t("المدينة", "City")}
                        </Label>
                        <Input
                          value={profileData.city}
                          onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                          disabled={!isEditing}
                          className={cn(
                            "h-12 rounded-xl transition-all duration-300",
                            isEditing
                              ? "bg-white border-[#1a365d]/30 focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d]"
                              : "bg-slate-50 border-slate-200",
                          )}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="flex items-center gap-2 text-slate-600 font-medium">
                          <MapPinned className="w-4 h-4" />
                          {t("العنوان", "Address")}
                        </Label>
                        <Input
                          value={profileData.address}
                          onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                          disabled={!isEditing}
                          className={cn(
                            "h-12 rounded-xl transition-all duration-300",
                            isEditing
                              ? "bg-white border-[#1a365d]/30 focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d]"
                              : "bg-slate-50 border-slate-200",
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="rewards" className="mt-0">
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                  <div className="p-6 border-b bg-gradient-to-r from-amber-50 to-yellow-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                        <Gift className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">
                          {t("برنامج الولاء والمكافآت", "Loyalty & Rewards")}
                        </h2>
                        <p className="text-sm text-slate-500">
                          {t("اكسب النقاط واستبدلها بمكافآت حصرية", "Earn points and redeem exclusive rewards")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <ProfileRewardsTab />
                  </div>
                </div>
              </TabsContent>

              {/* Addresses Tab */}
              <TabsContent value="addresses" className="mt-0">
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                  <div className="p-6 border-b bg-slate-50/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">
                          {t("العناوين المحفوظة", "Saved Addresses")}
                        </h2>
                        <p className="text-sm text-slate-500">
                          {t("إدارة عناوين التوصيل", "Manage your delivery addresses")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <SavedAddressesImproved
                      addresses={savedAddresses}
                      onAddAddress={handleAddAddress}
                      onUpdateAddress={handleUpdateAddress}
                      onDeleteAddress={handleDeleteAddress}
                      onSelectDefault={handleSelectDefault}
                      isLoading={addressLoading}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="mt-0">
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                  <div className="p-6 border-b bg-slate-50/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                        <Bell className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">{t("الإشعارات", "Notifications")}</h2>
                        <p className="text-sm text-slate-500">
                          {t("إدارة إعدادات الإشعارات", "Manage notification settings")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <ProfileNotificationsTab />
                  </div>
                </div>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="mt-0">
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                  <div className="p-6 border-b bg-slate-50/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#1a365d]/10 flex items-center justify-center">
                        <Package className="w-6 h-6 text-[#1a365d]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">{t("طلباتي", "My Orders")}</h2>
                        <p className="text-sm text-slate-500">
                          {t("تتبع ومراجعة طلباتك", "Track and review your orders")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {ordersLoading ? (
                      <div className="flex flex-col items-center justify-center py-16">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full border-4 border-slate-200 animate-pulse" />
                          <Loader2 className="w-8 h-8 absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-[#1a365d]" />
                        </div>
                        <p className="text-slate-500 mt-4">{t("جاري التحميل...", "Loading...")}</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                          <Package className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          {t("لا توجد طلبات بعد", "No orders yet")}
                        </h3>
                        <p className="text-slate-500 mb-6">
                          {t("ابدأ التسوق واستمتع بمنتجاتنا المميزة", "Start shopping and enjoy our products")}
                        </p>
                        <Button
                          onClick={() => router.push("/shop")}
                          className="gap-2 rounded-xl bg-[#1a365d] hover:bg-[#1a365d]/90"
                        >
                          <Sparkles className="w-4 h-4" />
                          {t("تسوق الآن", "Shop Now")}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => {
                          const config = statusConfig[order.status]
                          const StatusIcon = config.icon

                          return (
                            <div
                              key={order.id}
                              className="group bg-white rounded-2xl border overflow-hidden hover:shadow-lg hover:border-[#1a365d]/20 transition-all duration-300"
                            >
                              {/* Order Header */}
                              <div className="p-4 md:p-5 border-b bg-slate-50/50">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                  <div className="flex items-center gap-4">
                                    <div
                                      className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center",
                                        `bg-gradient-to-br ${config.gradient}`,
                                      )}
                                    >
                                      <StatusIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-slate-900">
                                        {t("طلب", "Order")} #{order.id.slice(0, 8).toUpperCase()}
                                      </p>
                                      <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {order.createdAt &&
                                          new Date((order.createdAt as any).seconds * 1000).toLocaleDateString(
                                            language === "ar" ? "ar-EG" : "en-US",
                                            { year: "numeric", month: "long", day: "numeric" },
                                          )}
                                      </div>
                                    </div>
                                  </div>
                                  <Badge className={cn("text-sm px-4 py-1.5 rounded-full border", config.color)}>
                                    {statusLabels[order.status][language]}
                                  </Badge>
                                </div>
                              </div>

                              {/* Order Items */}
                              <div className="p-4 md:p-5 space-y-3">
                                {order.items?.map((item: any, idx: number) => (
                                  <div key={idx} className="flex gap-4 items-center">
                                    <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100">
                                      <Image
                                        src={item.mainImage || "/placeholder.svg?height=80&width=80&query=clothing"}
                                        alt={language === "ar" ? item.productNameAr : item.productNameEn}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-slate-900 truncate">
                                        {language === "ar" ? item.productNameAr : item.productNameEn}
                                      </p>
                                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                        <span className="flex items-center gap-1">
                                          <span
                                            className="w-3 h-3 rounded-full border"
                                            style={{ backgroundColor: item.selectedColor }}
                                          />
                                          {item.selectedSize}
                                        </span>
                                        <span>x{item.quantity}</span>
                                      </div>
                                    </div>
                                    <p className="font-semibold text-slate-900 whitespace-nowrap">
                                      {(item.price * item.quantity).toFixed(0)}{" "}
                                      <span className="text-sm text-slate-500">{t("ج.م", "EGP")}</span>
                                    </p>
                                  </div>
                                ))}
                              </div>

                              {/* Order Footer */}
                              <div className="px-4 md:px-5 py-4 border-t bg-slate-50/30 flex items-center justify-between">
                                <span className="text-slate-500 font-medium">{t("الإجمالي", "Total")}</span>
                                <span className="text-xl font-bold text-[#1a365d]">
                                  {order.total?.toFixed(0)} {t("ج.م", "EGP")}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      <ChatWidget />
      <Footer />
    </div>
  )
}
