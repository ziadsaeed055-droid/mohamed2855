"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useLoyalty } from "@/contexts/loyalty-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LOYALTY_TIERS, type Reward, generateReferralCode, generateReferralUrl } from "@/lib/loyalty-types"
import {
  Crown,
  Gift,
  Star,
  Sparkles,
  Copy,
  Check,
  Share2,
  Users,
  TrendingUp,
  Clock,
  ArrowDown,
  Loader2,
  Trophy,
  Target,
  Zap,
  ShoppingBag,
  UserPlus,
  LogIn,
  History,
  Award,
  Coins,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ar, enUS } from "date-fns/locale"

export function ProfileRewardsTab() {
  const { t, language } = useLanguage()
  const { user } = useAuth()
  const { toast } = useToast()
  const {
    loyaltyData,
    transactions,
    referrals,
    rewards,
    redemptions,
    isLoading,
    referralUrl,
    tierInfo,
    pointsToNextTier,
    nextTierName,
    refreshLoyaltyData,
    refreshTransactions,
    refreshReferrals,
    refreshRewards,
    refreshRedemptions,
    handleRedeemReward,
    claimDailyBonus,
  } = useLoyalty()

  const [copied, setCopied] = useState(false)
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false)
  const [redeeming, setRedeeming] = useState(false)
  const [claimingDaily, setClaimingDaily] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState("overview")

  // Refresh data on mount
  useEffect(() => {
    refreshTransactions()
    refreshReferrals()
    refreshRedemptions()
  }, [refreshTransactions, refreshReferrals, refreshRedemptions])

  const displayReferralUrl = referralUrl || (user?.id ? generateReferralUrl(generateReferralCode(user.id)) : "")
  const displayReferralCode = loyaltyData?.referralCode || (user?.id ? generateReferralCode(user.id) : "")

  const handleCopyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(displayReferralUrl)
      setCopied(true)
      toast({
        title: t("تم النسخ!", "Copied!"),
        description: t("تم نسخ رابط الإحالة بنجاح", "Referral link copied to clipboard"),
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: t("خطأ", "Error"),
        description: t("فشل نسخ الرابط", "Failed to copy link"),
        variant: "destructive",
      })
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t("انضم إلى Seven Blue", "Join Seven Blue"),
          text: t(
            "سجل في Seven Blue واحصل على نقاط ومكافآت حصرية!",
            "Sign up at Seven Blue and get exclusive points and rewards!",
          ),
          url: displayReferralUrl,
        })
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopyReferralLink()
    }
  }

  const handleClaimDailyBonus = async () => {
    setClaimingDaily(true)
    try {
      const success = await claimDailyBonus()
      if (success) {
        toast({
          title: t("مبروك!", "Congratulations!"),
          description: t("حصلت على نقطة الدخول اليومي", "You received your daily login point"),
        })
      } else {
        toast({
          title: t("تم الحصول عليها بالفعل", "Already claimed"),
          description: t(
            "لقد حصلت على نقطة اليوم بالفعل. عد غداً!",
            "You already claimed today's point. Come back tomorrow!",
          ),
        })
      }
    } catch (err) {
      toast({
        title: t("خطأ", "Error"),
        description: t("فشل الحصول على النقاط", "Failed to claim points"),
        variant: "destructive",
      })
    } finally {
      setClaimingDaily(false)
    }
  }

  const handleRedeemClick = (reward: Reward) => {
    setSelectedReward(reward)
    setRedeemDialogOpen(true)
  }

  const handleConfirmRedeem = async () => {
    if (!selectedReward) return

    setRedeeming(true)
    try {
      const result = await handleRedeemReward(selectedReward.id)
      if (result.success) {
        toast({
          title: t("تم الاستبدال بنجاح!", "Successfully redeemed!"),
          description: t("تم خصم النقاط وسيتم التواصل معك قريباً", "Points deducted. We'll contact you soon."),
        })
        setRedeemDialogOpen(false)
      } else {
        toast({
          title: t("فشل الاستبدال", "Redemption failed"),
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: t("خطأ", "Error"),
        description: t("حدث خطأ أثناء الاستبدال", "An error occurred during redemption"),
        variant: "destructive",
      })
    } finally {
      setRedeeming(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "signup":
        return UserPlus
      case "daily_login":
        return LogIn
      case "referral_signup":
        return Users
      case "purchase":
        return ShoppingBag
      case "redeem":
        return Gift
      case "expired":
        return Clock
      case "admin_add":
        return TrendingUp
      case "admin_remove":
        return ArrowDown
      default:
        return Coins
    }
  }

  if (isLoading && !loyaltyData && !user?.id) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-slate-200 animate-pulse" />
          <Loader2 className="w-8 h-8 absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-[#1a365d]" />
        </div>
        <p className="text-slate-500 mt-4">{t("جاري التحميل...", "Loading...")}</p>
      </div>
    )
  }

  const displayLoyaltyData = loyaltyData || {
    totalPoints: 0,
    currentTier: "C" as const,
    totalPointsEarned: 0,
    totalPointsRedeemed: 0,
    referralCode: displayReferralCode,
    referralCount: 0,
    joinedLoyaltyAt: new Date(),
  }

  const displayTierInfo = tierInfo || LOYALTY_TIERS.C

  const progressToNextTier = displayTierInfo
    ? displayLoyaltyData.currentTier === "A"
      ? 100
      : ((displayLoyaltyData.totalPoints - displayTierInfo.minPoints) /
          (LOYALTY_TIERS[displayLoyaltyData.currentTier === "C" ? "B" : "A"].minPoints - displayTierInfo.minPoints)) *
        100
    : 0

  return (
    <div className="space-y-6">
      {/* Loyalty Overview Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a365d] via-[#2d4a7c] to-[#1a365d] p-6 text-white">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 end-0 w-64 h-64 bg-white rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 start-0 w-48 h-48 bg-amber-400 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
                  displayTierInfo?.bgColor,
                )}
                style={{ backgroundColor: displayTierInfo?.color + "30" }}
              >
                <Crown className="w-7 h-7" style={{ color: displayTierInfo?.color }} />
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  {language === "ar" ? displayTierInfo?.nameAr : displayTierInfo?.nameEn}
                </h3>
                <p className="text-white/70 text-sm">{t("مستوى عضويتك الحالي", "Your current tier")}</p>
              </div>
            </div>

            {/* Daily Bonus Button */}
            <Button
              onClick={handleClaimDailyBonus}
              disabled={claimingDaily}
              className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-xl gap-2"
            >
              {claimingDaily ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {t("نقطة يومية", "Daily Point")}
            </Button>
          </div>

          {/* Points Display */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-5 h-5 text-amber-400" />
                <span className="text-white/70 text-sm">{t("رصيد النقاط", "Points Balance")}</span>
              </div>
              <p className="text-3xl font-bold">{displayLoyaltyData.totalPoints.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-emerald-400" />
                <span className="text-white/70 text-sm">{t("إحالات ناجحة", "Successful Referrals")}</span>
              </div>
              <p className="text-3xl font-bold">{displayLoyaltyData.referralCount}</p>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {displayLoyaltyData.currentTier !== "A" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">{t("التقدم للمستوى التالي", "Progress to next tier")}</span>
                <span className="font-medium">
                  {pointsToNextTier} {t("نقطة متبقية", "points to go")}
                </span>
              </div>
              <Progress value={Math.max(0, Math.min(100, progressToNextTier))} className="h-3 bg-white/20" />
              <p className="text-xs text-white/60 text-center">
                {t("المستوى التالي:", "Next tier:")} {nextTierName}
              </p>
            </div>
          )}

          {displayLoyaltyData.currentTier === "A" && (
            <div className="text-center py-2">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/30">
                <Trophy className="w-4 h-4 me-1" />
                {t("أنت في أعلى مستوى!", "You're at the highest tier!")}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Referral Card */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Share2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{t("شارك واكسب!", "Share & Earn!")}</h3>
            <p className="text-sm text-slate-600">
              {t("احصل على 5 نقاط لكل صديق يسجل برابطك", "Get 5 points for each friend who signs up with your link")}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 bg-white rounded-xl border px-4 py-3 font-mono text-sm text-slate-600 truncate">
            {displayReferralUrl || t("جاري التحميل...", "Loading...")}
          </div>
          <Button onClick={handleCopyReferralLink} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {t("نسخ", "Copy")}
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            className="rounded-xl border-emerald-300 text-emerald-700 hover:bg-emerald-50 bg-transparent"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-xs text-slate-500 mt-3 text-center">
          {t("كود الإحالة الخاص بك:", "Your referral code:")} <span className="font-bold">{displayReferralCode}</span>
        </p>
      </div>

      {/* Sub Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="w-full h-auto p-1 bg-slate-100 rounded-xl grid grid-cols-4 gap-1">
          {[
            { value: "overview", icon: Award, label: t("المزايا", "Benefits") },
            { value: "rewards", icon: Gift, label: t("المكافآت", "Rewards") },
            { value: "history", icon: History, label: t("السجل", "History") },
            { value: "referrals", icon: Users, label: t("الإحالات", "Referrals") },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2.5 gap-1.5 text-sm"
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Benefits Tab */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4">
            {/* Tier Benefits */}
            <div className="bg-white rounded-xl border p-5">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                {t("مزايا مستواك الحالي", "Your Current Tier Benefits")}
              </h4>
              <div className="space-y-3">
                {(language === "ar" ? displayTierInfo?.benefits.ar : displayTierInfo?.benefits.en)?.map(
                  (benefit, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-slate-700">{benefit}</span>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* How to Earn Points */}
            <div className="bg-white rounded-xl border p-5">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                {t("كيف تكسب النقاط", "How to Earn Points")}
              </h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { icon: UserPlus, points: 3, label: t("تسجيل حساب جديد", "New account signup") },
                  { icon: LogIn, points: 1, label: t("دخول يومي", "Daily login") },
                  { icon: Users, points: 5, label: t("إحالة صديق", "Refer a friend") },
                  { icon: ShoppingBag, points: 1, label: t("كل 100 ج.م مشتريات", "Per 100 EGP spent") },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">{item.label}</p>
                      <p className="text-xs text-slate-500">
                        +{item.points} {t("نقطة", "point(s)")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All Tiers */}
            <div className="bg-white rounded-xl border p-5">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                {t("مستويات العضوية", "Membership Tiers")}
              </h4>
              <div className="grid sm:grid-cols-3 gap-4">
                {(["C", "B", "A"] as const).map((tierId) => {
                  const tier = LOYALTY_TIERS[tierId]
                  const isCurrentTier = displayLoyaltyData.currentTier === tierId
                  return (
                    <div
                      key={tierId}
                      className={cn(
                        "relative p-4 rounded-xl border-2 transition-all",
                        isCurrentTier ? "border-[#1a365d] bg-[#1a365d]/5" : "border-slate-200 bg-slate-50",
                      )}
                    >
                      {isCurrentTier && (
                        <Badge className="absolute -top-2 start-4 bg-[#1a365d]">{t("مستواك", "Your Tier")}</Badge>
                      )}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                        style={{ backgroundColor: tier.color + "20" }}
                      >
                        <Crown className="w-6 h-6" style={{ color: tier.color }} />
                      </div>
                      <h5 className="font-bold text-slate-900">{language === "ar" ? tier.nameAr : tier.nameEn}</h5>
                      <p className="text-xs text-slate-500 mt-1">
                        {tier.minPoints === 0
                          ? t("0 - 499 نقطة", "0 - 499 points")
                          : tier.maxPoints === Number.POSITIVE_INFINITY
                            ? t("1500+ نقطة", "1500+ points")
                            : `${tier.minPoints} - ${tier.maxPoints} ${t("نقطة", "points")}`}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Rewards Store Tab */}
        <TabsContent value="rewards" className="mt-4">
          <div className="space-y-4">
            {rewards.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <Gift className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  {t("لا توجد مكافآت متاحة حالياً", "No rewards available yet")}
                </h3>
                <p className="text-slate-500 text-sm">
                  {t("سيتم إضافة مكافآت قريباً. تابعنا!", "Rewards will be added soon. Stay tuned!")}
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {rewards.map((reward) => {
                  const canAfford = displayLoyaltyData.totalPoints >= reward.pointsRequired
                  return (
                    <div
                      key={reward.id}
                      className={cn(
                        "bg-white rounded-xl border overflow-hidden transition-all hover:shadow-lg",
                        !canAfford && "opacity-60",
                      )}
                    >
                      <div className="relative h-40 bg-slate-100">
                        <Image
                          src={reward.imageUrl || "/placeholder.svg?height=160&width=300&query=gift reward"}
                          alt={language === "ar" ? reward.nameAr : reward.nameEn}
                          fill
                          className="object-cover"
                        />
                        {reward.quantity <= 5 && reward.quantity > 0 && (
                          <Badge className="absolute top-2 end-2 bg-red-500">
                            {t(`متبقي ${reward.quantity}`, `${reward.quantity} left`)}
                          </Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-slate-900 mb-1">
                          {language === "ar" ? reward.nameAr : reward.nameEn}
                        </h4>
                        <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                          {language === "ar" ? reward.descriptionAr : reward.descriptionEn}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 text-amber-500" />
                            <span className="font-bold text-slate-900">{reward.pointsRequired}</span>
                            <span className="text-sm text-slate-500">{t("نقطة", "points")}</span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleRedeemClick(reward)}
                            disabled={!canAfford || reward.quantity <= 0}
                            className="rounded-lg"
                          >
                            {t("استبدال", "Redeem")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-4">
          <div className="bg-white rounded-xl border">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <History className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  {t("لا يوجد سجل للنقاط", "No points history yet")}
                </h3>
                <p className="text-slate-500 text-sm">
                  {t("ستظهر هنا جميع عمليات كسب واستبدال النقاط", "All points earned and redeemed will appear here")}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="divide-y">
                  {transactions.map((tx) => {
                    const Icon = getTransactionIcon(tx.type)
                    const isPositive = tx.points > 0
                    return (
                      <div key={tx.id} className="flex items-center gap-4 p-4 hover:bg-slate-50">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                            isPositive ? "bg-emerald-100" : "bg-red-100",
                          )}
                        >
                          <Icon className={cn("w-5 h-5", isPositive ? "text-emerald-600" : "text-red-600")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {language === "ar" ? tx.descriptionAr : tx.descriptionEn}
                          </p>
                          <p className="text-xs text-slate-500">
                            {format(tx.createdAt, "d MMM yyyy - HH:mm", { locale: language === "ar" ? ar : enUS })}
                          </p>
                        </div>
                        <div className="text-end">
                          <p className={cn("font-bold", isPositive ? "text-emerald-600" : "text-red-600")}>
                            {isPositive ? "+" : ""}
                            {tx.points}
                          </p>
                          <p className="text-xs text-slate-500">
                            {t("الرصيد:", "Balance:")} {tx.balanceAfter}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="mt-4">
          <div className="bg-white rounded-xl border">
            {referrals.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <Users className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{t("لا توجد إحالات بعد", "No referrals yet")}</h3>
                <p className="text-slate-500 text-sm mb-4">
                  {t("شارك رابط الإحالة الخاص بك واكسب نقاط!", "Share your referral link and earn points!")}
                </p>
                <Button onClick={handleCopyReferralLink} className="gap-2">
                  <Copy className="w-4 h-4" />
                  {t("نسخ الرابط", "Copy Link")}
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="divide-y">
                  {referrals.map((ref) => (
                    <div key={ref.id} className="flex items-center gap-4 p-4 hover:bg-slate-50">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <UserPlus className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{ref.referredUserName}</p>
                        <p className="text-xs text-slate-500">
                          {format(ref.createdAt, "d MMM yyyy", { locale: language === "ar" ? ar : enUS })}
                        </p>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                        +{ref.pointsAwarded} {t("نقطة", "pts")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Redeem Confirmation Dialog */}
      <Dialog open={redeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("تأكيد الاستبدال", "Confirm Redemption")}</DialogTitle>
            <DialogDescription>
              {t("هل أنت متأكد من استبدال هذه المكافأة؟", "Are you sure you want to redeem this reward?")}
            </DialogDescription>
          </DialogHeader>
          {selectedReward && (
            <div className="py-4">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-100">
                  <Image
                    src={selectedReward.imageUrl || "/placeholder.svg?height=80&width=80&query=gift"}
                    alt={language === "ar" ? selectedReward.nameAr : selectedReward.nameEn}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">
                    {language === "ar" ? selectedReward.nameAr : selectedReward.nameEn}
                  </h4>
                  <p className="text-sm text-slate-500">
                    {selectedReward.pointsRequired} {t("نقطة", "points")}
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{t("رصيدك الحالي", "Your balance")}</span>
                  <span className="font-bold">{displayLoyaltyData.totalPoints}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-slate-600">{t("سيتم خصم", "Will be deducted")}</span>
                  <span className="font-bold text-red-600">-{selectedReward.pointsRequired}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1 pt-2 border-t">
                  <span className="text-slate-600">{t("الرصيد بعد الخصم", "Balance after")}</span>
                  <span className="font-bold text-emerald-600">
                    {displayLoyaltyData.totalPoints - selectedReward.pointsRequired}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRedeemDialogOpen(false)} disabled={redeeming}>
              {t("إلغاء", "Cancel")}
            </Button>
            <Button onClick={handleConfirmRedeem} disabled={redeeming} className="gap-2">
              {redeeming && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("تأكيد الاستبدال", "Confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
