"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import { useChat } from "@/contexts/chat-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Reward, Redemption, Referral } from "@/lib/loyalty-types"
import {
  getAllRewards,
  createReward,
  updateReward,
  deleteReward,
  getAllRedemptions,
  updateRedemptionStatus,
  getAllReferrals,
  getTopReferrers,
} from "@/lib/loyalty-service"
import { uploadImage, validateImageFile } from "@/lib/storage-service"
import {
  Gift,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Star,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  MessageSquare,
  Trophy,
  Search,
  MoreVertical,
  ArrowUpRight,
  History,
  ImageIcon,
  Upload,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ar, enUS } from "date-fns/locale"

const rewardCategories = [
  { value: "discount", labelAr: "خصم", labelEn: "Discount" },
  { value: "product", labelAr: "منتج", labelEn: "Product" },
  { value: "voucher", labelAr: "قسيمة", labelEn: "Voucher" },
  { value: "experience", labelAr: "تجربة", labelEn: "Experience" },
]

const redemptionStatusConfig = {
  pending: {
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Clock,
    labelAr: "قيد الانتظار",
    labelEn: "Pending",
  },
  fulfilled: {
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
    labelAr: "تم التسليم",
    labelEn: "Fulfilled",
  },
  cancelled: {
    color: "bg-red-100 text-red-700 border-red-200",
    icon: XCircle,
    labelAr: "ملغي",
    labelEn: "Cancelled",
  },
}

export function AdminRewardsTab() {
  const { t, language } = useLanguage()
  const { toast } = useToast()
  const { setActiveConversation, openChatWithUser } = useChat()

  const [activeSubTab, setActiveSubTab] = useState("rewards")
  const [rewards, setRewards] = useState<Reward[]>([])
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [topReferrers, setTopReferrers] = useState<
    Array<{ userId: string; userName: string; referralCount: number; totalPointsEarned: number }>
  >([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Dialog states
  const [rewardDialogOpen, setRewardDialogOpen] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [savingReward, setSavingReward] = useState(false)
  const [rewardForm, setRewardForm] = useState({
    nameAr: "",
    nameEn: "",
    descriptionAr: "",
    descriptionEn: "",
    imageUrl: "",
    pointsRequired: 100,
    quantity: 10,
    category: "discount" as const,
    value: 0,
    isActive: true,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [rewardsData, redemptionsData, referralsData, topReferrersData] = await Promise.all([
        getAllRewards(false),
        getAllRedemptions(100),
        getAllReferrals(100),
        getTopReferrers(10),
      ])
      setRewards(rewardsData)
      setRedemptions(redemptionsData)
      setReferrals(referralsData)
      setTopReferrers(topReferrersData)
      console.log("[v0] Admin rewards data loaded")
    } catch (error) {
      console.error("[v0] Error loading admin rewards data:", error)
      toast({
        title: t("خطأ", "Error"),
        description: t("فشل تحميل البيانات", "Failed to load data"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [t, toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast({
        title: t("خطأ في الملف", "File Error"),
        description: validation.error,
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)
    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
  }

  const clearSelectedImage = () => {
    setSelectedFile(null)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview(null)
    }
    setRewardForm({ ...rewardForm, imageUrl: "" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Handle create/edit reward
  const handleSaveReward = async () => {
    if (!rewardForm.nameAr || !rewardForm.nameEn || rewardForm.pointsRequired <= 0) {
      toast({
        title: t("خطأ", "Error"),
        description: t("يرجى ملء جميع الحقول المطلوبة", "Please fill all required fields"),
        variant: "destructive",
      })
      return
    }

    setSavingReward(true)
    try {
      let imageUrl = rewardForm.imageUrl

      if (selectedFile) {
        setUploadingImage(true)
        try {
          imageUrl = await uploadImage(selectedFile, "rewards")
          console.log("[v0] Image uploaded successfully:", imageUrl)
        } catch (uploadError) {
          console.error("[v0] Error uploading image:", uploadError)
          toast({
            title: t("خطأ في رفع الصورة", "Image Upload Error"),
            description: t("فشل رفع الصورة. يرجى المحاولة مرة أخرى", "Failed to upload image. Please try again"),
            variant: "destructive",
          })
          setSavingReward(false)
          setUploadingImage(false)
          return
        }
        setUploadingImage(false)
      }

      const rewardData = { ...rewardForm, imageUrl }

      if (editingReward) {
        await updateReward(editingReward.id, rewardData)
        toast({
          title: t("تم التحديث", "Updated"),
          description: t("تم تحديث المكافأة بنجاح", "Reward updated successfully"),
        })
      } else {
        await createReward(rewardData)
        toast({
          title: t("تم الإنشاء", "Created"),
          description: t("تم إنشاء المكافأة بنجاح", "Reward created successfully"),
        })
      }
      setRewardDialogOpen(false)
      resetRewardForm()
      loadData()
    } catch (error) {
      console.error("[v0] Error saving reward:", error)
      toast({
        title: t("خطأ", "Error"),
        description: t("فشل حفظ المكافأة", "Failed to save reward"),
        variant: "destructive",
      })
    } finally {
      setSavingReward(false)
    }
  }

  const handleEditReward = (reward: Reward) => {
    setEditingReward(reward)
    setRewardForm({
      nameAr: reward.nameAr,
      nameEn: reward.nameEn,
      descriptionAr: reward.descriptionAr,
      descriptionEn: reward.descriptionEn,
      imageUrl: reward.imageUrl,
      pointsRequired: reward.pointsRequired,
      quantity: reward.quantity,
      category: reward.category,
      value: reward.value || 0,
      isActive: reward.isActive,
    })
    if (reward.imageUrl) {
      setImagePreview(reward.imageUrl)
    }
    setRewardDialogOpen(true)
  }

  const handleDeleteReward = async (rewardId: string) => {
    if (!confirm(t("هل أنت متأكد من حذف هذه المكافأة؟", "Are you sure you want to delete this reward?"))) return

    try {
      await deleteReward(rewardId)
      toast({
        title: t("تم الحذف", "Deleted"),
        description: t("تم حذف المكافأة بنجاح", "Reward deleted successfully"),
      })
      loadData()
    } catch (error) {
      console.error("[v0] Error deleting reward:", error)
      toast({
        title: t("خطأ", "Error"),
        description: t("فشل حذف المكافأة", "Failed to delete reward"),
        variant: "destructive",
      })
    }
  }

  const handleUpdateRedemptionStatus = async (
    redemptionId: string,
    status: "pending" | "fulfilled" | "cancelled",
    adminNotes?: string,
  ) => {
    try {
      await updateRedemptionStatus(redemptionId, status, adminNotes)
      toast({
        title: t("تم التحديث", "Updated"),
        description: t("تم تحديث حالة الاستبدال", "Redemption status updated"),
      })
      loadData()
    } catch (error) {
      console.error("[v0] Error updating redemption status:", error)
      toast({
        title: t("خطأ", "Error"),
        description: t("فشل تحديث الحالة", "Failed to update status"),
        variant: "destructive",
      })
    }
  }

  const resetRewardForm = () => {
    setEditingReward(null)
    setRewardForm({
      nameAr: "",
      nameEn: "",
      descriptionAr: "",
      descriptionEn: "",
      imageUrl: "",
      pointsRequired: 100,
      quantity: 10,
      category: "discount",
      value: 0,
      isActive: true,
    })
    clearSelectedImage()
  }

  const handleOpenChat = (userId: string) => {
    if (openChatWithUser) {
      openChatWithUser(userId)
    }
  }

  // Stats
  const totalRewards = rewards.length
  const activeRewards = rewards.filter((r) => r.isActive).length
  const pendingRedemptions = redemptions.filter((r) => r.status === "pending").length
  const totalReferrals = referrals.length
  const totalPointsFromReferrals = referrals.reduce((sum, r) => sum + r.pointsAwarded, 0)

  // Filter redemptions
  const filteredRedemptions = redemptions.filter((r) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      r.userName.toLowerCase().includes(query) ||
      r.userEmail.toLowerCase().includes(query) ||
      r.rewardNameAr.toLowerCase().includes(query) ||
      r.rewardNameEn.toLowerCase().includes(query)
    )
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-slate-200 animate-pulse" />
          <Loader2 className="w-8 h-8 absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-primary" />
        </div>
        <p className="text-muted-foreground mt-4">{t("جاري التحميل...", "Loading...")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-background rounded-2xl border p-5 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Gift className="w-6 h-6 text-purple-600" />
            </div>
            <Badge variant="secondary" className="text-xs">
              {activeRewards} {t("نشط", "active")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-1">{t("إجمالي المكافآت", "Total Rewards")}</p>
          <p className="text-2xl font-bold text-foreground">{totalRewards}</p>
        </div>

        <div className="bg-background rounded-2xl border p-5 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            {pendingRedemptions > 0 && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                {pendingRedemptions} {t("جديد", "new")}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-1">{t("طلبات الاستبدال", "Redemption Requests")}</p>
          <p className="text-2xl font-bold text-foreground">{redemptions.length}</p>
        </div>

        <div className="bg-background rounded-2xl border p-5 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4" />
              <span>{totalPointsFromReferrals}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">{t("إجمالي الإحالات", "Total Referrals")}</p>
          <p className="text-2xl font-bold text-foreground">{totalReferrals}</p>
        </div>

        <div className="bg-background rounded-2xl border p-5 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">{t("أفضل محيل", "Top Referrer")}</p>
          <p className="text-lg font-bold text-foreground truncate">
            {topReferrers[0]?.userName || t("لا يوجد", "None")}
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <div className="bg-background rounded-2xl p-2 shadow-sm border">
          <TabsList className="grid w-full grid-cols-4 bg-transparent gap-1">
            {[
              { value: "rewards", icon: Gift, label: t("المكافآت", "Rewards") },
              { value: "redemptions", icon: History, label: t("سجل الاستبدال", "Redemptions") },
              { value: "referrals", icon: Users, label: t("الإحالات", "Referrals") },
              { value: "top-referrers", icon: Trophy, label: t("الأفضل", "Top Referrers") },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 py-3 rounded-xl transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden md:inline font-medium">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Rewards Management Tab */}
        <TabsContent value="rewards" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">{t("إدارة المكافآت", "Manage Rewards")}</h3>
            <Button
              onClick={() => {
                resetRewardForm()
                setRewardDialogOpen(true)
              }}
              className="gap-2 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              {t("إضافة مكافأة", "Add Reward")}
            </Button>
          </div>

          {rewards.length === 0 ? (
            <div className="text-center py-16 bg-background rounded-2xl border">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Gift className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{t("لا توجد مكافآت", "No rewards yet")}</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {t("أضف مكافآت ليتمكن المستخدمون من استبدال نقاطهم", "Add rewards for users to redeem their points")}
              </p>
              <Button
                onClick={() => {
                  resetRewardForm()
                  setRewardDialogOpen(true)
                }}
                className="gap-2 rounded-xl"
              >
                <Plus className="w-4 h-4" />
                {t("إضافة أول مكافأة", "Add First Reward")}
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className={cn(
                    "bg-background rounded-2xl border overflow-hidden hover:shadow-lg transition-all",
                    !reward.isActive && "opacity-60",
                  )}
                >
                  <div className="relative h-40 bg-muted">
                    {reward.imageUrl ? (
                      <Image
                        src={reward.imageUrl || "/placeholder.svg"}
                        alt={language === "ar" ? reward.nameAr : reward.nameEn}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-2 start-2 flex gap-2">
                      <Badge className={reward.isActive ? "bg-emerald-500" : "bg-slate-500"}>
                        {reward.isActive ? t("نشط", "Active") : t("غير نشط", "Inactive")}
                      </Badge>
                      <Badge variant="secondary">
                        {
                          rewardCategories.find((c) => c.value === reward.category)?.[
                            language === "ar" ? "labelAr" : "labelEn"
                          ]
                        }
                      </Badge>
                    </div>
                    <div className="absolute top-2 end-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="icon" className="h-8 w-8 rounded-lg">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditReward(reward)}>
                            <Edit className="w-4 h-4 me-2" />
                            {t("تعديل", "Edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteReward(reward.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 me-2" />
                            {t("حذف", "Delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-foreground">{language === "ar" ? reward.nameAr : reward.nameEn}</h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {language === "ar" ? reward.descriptionAr : reward.descriptionEn}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-5 h-5 text-amber-500" />
                        <span className="font-bold text-lg">{reward.pointsRequired}</span>
                        <span className="text-sm text-muted-foreground">{t("نقطة", "pts")}</span>
                      </div>
                      <Badge variant="outline">
                        {t("الكمية:", "Qty:")} {reward.quantity}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Redemptions Tab */}
        <TabsContent value="redemptions" className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-foreground">{t("سجل الاستبدال", "Redemption History")}</h3>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("بحث...", "Search...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-10 rounded-xl"
              />
            </div>
          </div>

          <div className="bg-background rounded-2xl border overflow-hidden">
            <ScrollArea className="h-[500px]">
              {filteredRedemptions.length === 0 ? (
                <div className="text-center py-16">
                  <History className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">{t("لا توجد عمليات استبدال", "No redemptions yet")}</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredRedemptions.map((redemption) => {
                    const statusConfig = redemptionStatusConfig[redemption.status]
                    const StatusIcon = statusConfig.icon
                    return (
                      <div key={redemption.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                            {redemption.rewardImageUrl ? (
                              <Image
                                src={redemption.rewardImageUrl || "/placeholder.svg"}
                                alt={language === "ar" ? redemption.rewardNameAr : redemption.rewardNameEn}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Gift className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-foreground">
                                {language === "ar" ? redemption.rewardNameAr : redemption.rewardNameEn}
                              </h4>
                              <Badge className={cn("border", statusConfig.color)}>
                                <StatusIcon className="w-3 h-3 me-1" />
                                {language === "ar" ? statusConfig.labelAr : statusConfig.labelEn}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">{redemption.userName}</span> - {redemption.userEmail}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-amber-500" />
                                {redemption.pointsSpent} {t("نقطة", "pts")}
                              </span>
                              <span>
                                {format(redemption.createdAt, "PPp", { locale: language === "ar" ? ar : enUS })}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-lg bg-transparent"
                              onClick={() => handleOpenChat(redemption.userId)}
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg bg-transparent">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {redemption.status !== "fulfilled" && (
                                  <DropdownMenuItem
                                    onClick={() => handleUpdateRedemptionStatus(redemption.id, "fulfilled")}
                                  >
                                    <CheckCircle className="w-4 h-4 me-2 text-emerald-600" />
                                    {t("تم التسليم", "Mark as Fulfilled")}
                                  </DropdownMenuItem>
                                )}
                                {redemption.status === "pending" && (
                                  <DropdownMenuItem
                                    onClick={() => handleUpdateRedemptionStatus(redemption.id, "cancelled")}
                                  >
                                    <XCircle className="w-4 h-4 me-2 text-red-600" />
                                    {t("إلغاء", "Cancel")}
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="mt-6 space-y-4">
          <h3 className="text-lg font-bold text-foreground">{t("سجل الإحالات", "Referral History")}</h3>

          <div className="bg-background rounded-2xl border overflow-hidden">
            <ScrollArea className="h-[500px]">
              {referrals.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">{t("لا توجد إحالات بعد", "No referrals yet")}</p>
                </div>
              ) : (
                <div className="divide-y">
                  {referrals.map((referral) => (
                    <div key={referral.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{referral.referrerName}</span>
                            <span className="text-muted-foreground">→</span>
                            <span className="font-medium text-foreground">{referral.referredUserName}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{referral.referredUserEmail}</p>
                        </div>
                        <div className="text-end">
                          <Badge className="bg-emerald-100 text-emerald-700 border-0">
                            +{referral.pointsAwarded} {t("نقطة", "pts")}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(referral.createdAt, "PP", { locale: language === "ar" ? ar : enUS })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </TabsContent>

        {/* Top Referrers Tab */}
        <TabsContent value="top-referrers" className="mt-6 space-y-4">
          <h3 className="text-lg font-bold text-foreground">{t("أفضل المحيلين", "Top Referrers")}</h3>

          <div className="bg-background rounded-2xl border overflow-hidden">
            {topReferrers.length === 0 ? (
              <div className="text-center py-16">
                <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">{t("لا يوجد محيلين بعد", "No referrers yet")}</p>
              </div>
            ) : (
              <div className="divide-y">
                {topReferrers.map((referrer, index) => {
                  const isTop3 = index < 3
                  const medalColors = ["text-amber-500", "text-slate-400", "text-amber-700"]
                  return (
                    <div key={referrer.userId} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg",
                            isTop3 ? "bg-amber-100" : "bg-muted",
                          )}
                        >
                          {isTop3 ? (
                            <Trophy className={cn("w-6 h-6", medalColors[index])} />
                          ) : (
                            <span className="text-muted-foreground">#{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{referrer.userName}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {referrer.referralCount} {t("إحالة", "referrals")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-amber-500" />
                              {referrer.totalPointsEarned} {t("نقطة", "pts")}
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-lg gap-2 bg-transparent">
                          <MessageSquare className="w-4 h-4" />
                          {t("مراسلة", "Message")}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Reward Dialog - Updated with file upload */}
      <Dialog open={rewardDialogOpen} onOpenChange={setRewardDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingReward ? t("تعديل المكافأة", "Edit Reward") : t("إضافة مكافأة جديدة", "Add New Reward")}
            </DialogTitle>
            <DialogDescription>
              {t("أدخل تفاصيل المكافأة التي سيستطيع المستخدمون استبدالها", "Enter reward details for users to redeem")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("الاسم بالعربية", "Name (Arabic)")} *</Label>
                <Input
                  value={rewardForm.nameAr}
                  onChange={(e) => setRewardForm({ ...rewardForm, nameAr: e.target.value })}
                  placeholder={t("خصم 10%", "10% Discount")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("الاسم بالإنجليزية", "Name (English)")} *</Label>
                <Input
                  value={rewardForm.nameEn}
                  onChange={(e) => setRewardForm({ ...rewardForm, nameEn: e.target.value })}
                  placeholder="10% Discount"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("الوصف بالعربية", "Description (Arabic)")}</Label>
              <Textarea
                value={rewardForm.descriptionAr}
                onChange={(e) => setRewardForm({ ...rewardForm, descriptionAr: e.target.value })}
                placeholder={t("وصف المكافأة...", "Reward description...")}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("الوصف بالإنجليزية", "Description (English)")}</Label>
              <Textarea
                value={rewardForm.descriptionEn}
                onChange={(e) => setRewardForm({ ...rewardForm, descriptionEn: e.target.value })}
                placeholder="Reward description..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("صورة المكافأة", "Reward Image")}</Label>
              <div className="border-2 border-dashed rounded-xl p-4 transition-colors hover:border-primary/50">
                {imagePreview ? (
                  <div className="relative">
                    <div className="relative w-full h-40 rounded-lg overflow-hidden bg-muted">
                      <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 end-2 h-8 w-8 rounded-lg"
                      onClick={clearSelectedImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center py-6 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      {t("اضغط لاختيار صورة", "Click to select image")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("JPG, PNG, GIF, WebP (الحد الأقصى 5MB)", "JPG, PNG, GIF, WebP (max 5MB)")}
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("النقاط المطلوبة", "Points Required")} *</Label>
                <Input
                  type="number"
                  min={1}
                  value={rewardForm.pointsRequired}
                  onChange={(e) =>
                    setRewardForm({ ...rewardForm, pointsRequired: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t("الكمية المتاحة", "Available Quantity")}</Label>
                <Input
                  type="number"
                  min={0}
                  value={rewardForm.quantity}
                  onChange={(e) => setRewardForm({ ...rewardForm, quantity: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("الفئة", "Category")}</Label>
                <Select
                  value={rewardForm.category}
                  onValueChange={(value: any) => setRewardForm({ ...rewardForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rewardCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {language === "ar" ? cat.labelAr : cat.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("القيمة (للخصومات)", "Value (for discounts)")}</Label>
                <Input
                  type="number"
                  min={0}
                  value={rewardForm.value}
                  onChange={(e) => setRewardForm({ ...rewardForm, value: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={rewardForm.isActive}
                onChange={(e) => setRewardForm({ ...rewardForm, isActive: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="isActive">{t("المكافأة نشطة ومتاحة للاستبدال", "Reward is active and available")}</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRewardDialogOpen(false)} className="rounded-xl">
              {t("إلغاء", "Cancel")}
            </Button>
            <Button onClick={handleSaveReward} disabled={savingReward || uploadingImage} className="rounded-xl gap-2">
              {savingReward || uploadingImage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {uploadingImage ? t("جاري رفع الصورة...", "Uploading...") : t("جاري الحفظ...", "Saving...")}
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4" />
                  {editingReward ? t("تحديث", "Update") : t("إنشاء", "Create")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
