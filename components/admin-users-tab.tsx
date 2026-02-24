"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import { useChat } from "@/contexts/chat-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { collection, getDocs, query, orderBy, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { LOYALTY_TIERS, type LoyaltyTier } from "@/lib/loyalty-types"
import {
  Users,
  Search,
  Loader2,
  Mail,
  Phone,
  Calendar,
  Award,
  UserCheck,
  UserX,
  ShoppingBag,
  Star,
  MessageSquare,
  Copy,
  CheckCircle2,
  TrendingUp,
  Filter,
  Eye,
  Chrome,
  KeyRound,
  Gift,
  Ban,
  MoreVertical,
  Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ar, enUS } from "date-fns/locale"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface UserData {
  id: string
  email: string
  displayName: string
  photoURL?: string
  phone?: string
  createdAt: Date
  role?: string
  referralCode?: string
  loyalty?: {
    points: number
    tier: LoyaltyTier
    referralCount: number
    lastDailyLogin?: Date
  }
  loginMethod?: "google" | "email"
  isActive?: boolean
}

interface UserStats {
  totalUsers: number
  googleUsers: number
  emailUsers: number
  activeUsers: number
  inactiveUsers: number
  totalPoints: number
  totalReferrals: number
  usersWithOrders: number
  usersWithoutOrders: number
}

export function AdminUsersTab() {
  const { t, language } = useLanguage()
  const { toast } = useToast()
  const { openChatWithUser } = useChat()

  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLoginMethod, setSelectedLoginMethod] = useState<string>("all")
  const [selectedTier, setSelectedTier] = useState<string>("all")
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string>("all")
  const [minPoints, setMinPoints] = useState<string>("")
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    googleUsers: 0,
    emailUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalPoints: 0,
    totalReferrals: 0,
    usersWithOrders: 0,
    usersWithoutOrders: 0,
  })
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [userDetails, setUserDetails] = useState<any>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Fetch all users
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const usersSnap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")))

      const usersData: UserData[] = usersSnap.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          email: data.email || "",
          displayName: data.displayName || data.name || "مستخدم",
          photoURL: data.photoURL || "",
          phone: data.phone || "",
          createdAt: data.createdAt?.toDate() || new Date(),
          role: data.role || "user",
          referralCode: data.referralCode || "",
          loyalty: data.loyalty || { points: 0, tier: "C", referralCount: 0 },
          loginMethod: data.provider === "google.com" ? "google" : "email",
          isActive: data.isActive !== false,
        }
      })

      setUsers(usersData)
      calculateStats(usersData)
    } catch (error) {
      console.error("[v0] Error fetching users:", error)
      toast({
        title: t("خطأ", "Error"),
        description: t("فشل تحميل المستخدمين", "Failed to load users"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = async (usersData: UserData[]) => {
    const googleUsers = usersData.filter((u) => u.loginMethod === "google").length
    const emailUsers = usersData.filter((u) => u.loginMethod === "email").length
    const activeUsers = usersData.filter((u) => u.isActive !== false).length
    const inactiveUsers = usersData.length - activeUsers
    const totalPoints = usersData.reduce((sum, u) => sum + (u.loyalty?.points || 0), 0)
    const totalReferrals = usersData.reduce((sum, u) => sum + (u.loyalty?.referralCount || 0), 0)

    // Fetch orders to count users with orders
    try {
      const ordersSnap = await getDocs(collection(db, "orders"))
      const userIdsWithOrders = new Set(ordersSnap.docs.map((doc) => doc.data().userId))
      const usersWithOrders = usersData.filter((u) => userIdsWithOrders.has(u.id)).length

      setStats({
        totalUsers: usersData.length,
        googleUsers,
        emailUsers,
        activeUsers,
        inactiveUsers,
        totalPoints,
        totalReferrals,
        usersWithOrders,
        usersWithoutOrders: usersData.length - usersWithOrders,
      })
    } catch (error) {
      console.error("[v0] Error calculating stats:", error)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesLoginMethod = selectedLoginMethod === "all" || user.loginMethod === selectedLoginMethod

    const matchesTier = selectedTier === "all" || user.loyalty?.tier === selectedTier

    const matchesPoints = !minPoints || (user.loyalty?.points || 0) >= Number.parseInt(minPoints)

    return matchesSearch && matchesLoginMethod && matchesTier && matchesPoints
  })

  const handleViewDetails = async (user: UserData) => {
    setSelectedUser(user)
    setLoadingDetails(true)

    try {
      // Fetch user point transactions
      const transactionsSnap = await getDocs(
        query(collection(db, "pointTransactions"), where("userId", "==", user.id), orderBy("createdAt", "desc")),
      )
      const transactions = transactionsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }))

      // Fetch user referrals
      const referralsSnap = await getDocs(
        query(collection(db, "referrals"), where("referrerId", "==", user.id), orderBy("createdAt", "desc")),
      )
      const referrals = referralsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }))

      // Fetch user orders
      const ordersSnap = await getDocs(
        query(collection(db, "orders"), where("userId", "==", user.id), orderBy("createdAt", "desc")),
      )
      const orders = ordersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }))

      setUserDetails({
        transactions,
        referrals,
        orders,
      })
    } catch (error) {
      console.error("[v0] Error fetching user details:", error)
      toast({
        title: t("خطأ", "Error"),
        description: t("فشل تحميل تفاصيل المستخدم", "Failed to load user details"),
        variant: "destructive",
      })
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleToggleUserStatus = async (user: UserData) => {
    // Logic to toggle user status
  }

  const handleSendNotification = async (user: UserData) => {
    // Logic to send notification
  }

  const copyReferralCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: t("تم النسخ", "Copied"),
      description: t("تم نسخ رمز الإحالة", "Referral code copied"),
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalUsers}</p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{t("إجمالي المستخدمين", "Total Users")}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950 dark:to-emerald-900/30 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between mb-2">
            <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(0) : 0}%
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{stats.activeUsers}</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">{t("نشط", "Active")}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950 dark:to-amber-900/30 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <Gift className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{stats.totalPoints.toLocaleString()}</p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">{t("إجمالي النقاط", "Total Points")}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950 dark:to-purple-900/30 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-2">
            <ShoppingBag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
              {stats.totalUsers > 0 ? ((stats.usersWithOrders / stats.totalUsers) * 100).toFixed(0) : 0}%
            </span>
          </div>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.usersWithOrders}</p>
          <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">{t("قاموا بطلبات", "With Orders")}</p>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-background rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-2">
            <Chrome className="w-4 h-4 text-red-500" />
            <p className="text-xs text-muted-foreground">{t("جوجل", "Google")}</p>
          </div>
          <p className="text-xl font-bold">{stats.googleUsers}</p>
        </div>

        <div className="bg-background rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-2">
            <KeyRound className="w-4 h-4 text-blue-500" />
            <p className="text-xs text-muted-foreground">{t("بريد/كلمة مرور", "Email/Password")}</p>
          </div>
          <p className="text-xl font-bold">{stats.emailUsers}</p>
        </div>

        <div className="bg-background rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-amber-500" />
            <p className="text-xs text-muted-foreground">{t("إحالات", "Referrals")}</p>
          </div>
          <p className="text-xl font-bold">{stats.totalReferrals}</p>
        </div>

        <div className="bg-background rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-2">
            <UserX className="w-4 h-4 text-red-500" />
            <p className="text-xs text-muted-foreground">{t("بدون طلبات", "No Orders")}</p>
          </div>
          <p className="text-xl font-bold">{stats.usersWithoutOrders}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-background rounded-xl p-4 border">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">{t("البحث والفلترة", "Search & Filter")}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("بحث بالاسم/البريد/الهاتف", "Search by name/email/phone")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-10"
            />
          </div>

          <Select value={selectedLoginMethod} onValueChange={setSelectedLoginMethod}>
            <SelectTrigger>
              <SelectValue placeholder={t("طريقة التسجيل", "Login Method")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("الكل", "All")}</SelectItem>
              <SelectItem value="google">{t("جوجل", "Google")}</SelectItem>
              <SelectItem value="email">{t("بريد/كلمة مرور", "Email/Password")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedTier} onValueChange={setSelectedTier}>
            <SelectTrigger>
              <SelectValue placeholder={t("مستوى الولاء", "Loyalty Tier")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("الكل", "All")}</SelectItem>
              <SelectItem value="A">{t("ذهبي (A)", "Gold (A)")}</SelectItem>
              <SelectItem value="B">{t("فضي (B)", "Silver (B)")}</SelectItem>
              <SelectItem value="C">{t("برونزي (C)", "Bronze (C)")}</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder={t("الحد الأدنى للنقاط", "Min Points")}
            value={minPoints}
            onChange={(e) => setMinPoints(e.target.value)}
          />

          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("")
              setSelectedLoginMethod("all")
              setSelectedTier("all")
              setMinPoints("")
            }}
            className="w-full"
          >
            {t("إعادة تعيين", "Reset")}
          </Button>
        </div>

        <div className="mt-3 text-sm text-muted-foreground">
          {t("عرض", "Showing")} {filteredUsers.length} {t("من", "of")} {users.length} {t("مستخدم", "users")}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-background rounded-xl border overflow-hidden">
        <ScrollArea className="h-[600px]">
          <table className="w-full">
            <thead className="bg-muted/50 sticky top-0 z-10">
              <tr>
                <th className="text-start p-4 text-sm font-semibold">{t("المستخدم", "User")}</th>
                <th className="text-start p-4 text-sm font-semibold">{t("التواصل", "Contact")}</th>
                <th className="text-start p-4 text-sm font-semibold">{t("التسجيل", "Registration")}</th>
                <th className="text-start p-4 text-sm font-semibold">{t("الولاء", "Loyalty")}</th>
                <th className="text-start p-4 text-sm font-semibold">{t("النقاط", "Points")}</th>
                <th className="text-start p-4 text-sm font-semibold">{t("الإحالات", "Referrals")}</th>
                <th className="text-center p-4 text-sm font-semibold">{t("إجراءات", "Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {user.photoURL ? (
                          <Image
                            src={user.photoURL || "/placeholder.svg"}
                            alt={user.displayName}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                        )}
                        {user.isActive !== false && (
                          <div className="absolute -bottom-0.5 -end-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground">{user.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground text-xs">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground text-xs">{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <Badge variant="outline" className="gap-1">
                        {user.loginMethod === "google" ? (
                          <>
                            <Chrome className="w-3 h-3" />
                            {t("جوجل", "Google")}
                          </>
                        ) : (
                          <>
                            <KeyRound className="w-3 h-3" />
                            {t("بريد", "Email")}
                          </>
                        )}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {format(user.createdAt, "dd/MM/yyyy", { locale: language === "ar" ? ar : enUS })}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge
                      className={cn(
                        "gap-1",
                        user.loyalty?.tier === "A" && "bg-yellow-100 text-yellow-800 border-yellow-300",
                        user.loyalty?.tier === "B" && "bg-slate-100 text-slate-700 border-slate-300",
                        user.loyalty?.tier === "C" && "bg-amber-100 text-amber-700 border-amber-300",
                      )}
                    >
                      <Award className="w-3 h-3" />
                      {language === "ar"
                        ? LOYALTY_TIERS[user.loyalty?.tier || "C"].nameAr
                        : LOYALTY_TIERS[user.loyalty?.tier || "C"].nameEn}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-semibold">{user.loyalty?.points || 0}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold">{user.loyalty?.referralCount || 0}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(user)} className="gap-1">
                        <Eye className="w-3 h-3" />
                        {t("التفاصيل", "Details")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openChatWithUser(user.id, user.displayName)}
                        className="gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleToggleUserStatus(user)}>
                            {user.isActive !== false ? (
                              <>
                                <Ban className="w-4 h-4 me-2" />
                                {t("إيقاف الحساب", "Suspend Account")}
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 me-2" />
                                {t("تفعيل الحساب", "Activate Account")}
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyReferralCode(user.referralCode || "")}>
                            <Copy className="w-4 h-4 me-2" />
                            {t("نسخ رمز الإحالة", "Copy Referral Code")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendNotification(user)}>
                            <Bell className="w-4 h-4 me-2" />
                            {t("إرسال إشعار", "Send Notification")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openChatWithUser(user.id, user.displayName)}>
                            <MessageSquare className="w-4 h-4 me-2" />
                            {t("فتح الدردشة", "Open Chat")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">{t("لا توجد نتائج", "No results found")}</p>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedUser?.photoURL ? (
                <Image
                  src={selectedUser.photoURL || "/placeholder.svg"}
                  alt={selectedUser.displayName}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              )}
              <div>
                <p>{selectedUser?.displayName}</p>
                <p className="text-sm font-normal text-muted-foreground">{selectedUser?.email}</p>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">{t("تفاصيل المستخدم", "User Details")}</DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6 mt-4">
              {/* User Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">{t("النقاط", "Points")}</p>
                  <p className="text-2xl font-bold text-amber-600">{selectedUser?.loyalty?.points || 0}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">{t("المستوى", "Tier")}</p>
                  <p className="text-lg font-bold">
                    {language === "ar"
                      ? LOYALTY_TIERS[selectedUser?.loyalty?.tier || "C"].nameAr
                      : LOYALTY_TIERS[selectedUser?.loyalty?.tier || "C"].nameEn}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">{t("الإحالات", "Referrals")}</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedUser?.loyalty?.referralCount || 0}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">{t("الطلبات", "Orders")}</p>
                  <p className="text-2xl font-bold text-emerald-600">{userDetails?.orders?.length || 0}</p>
                </div>
              </div>

              {/* Referral Code */}
              {selectedUser?.referralCode && (
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium mb-1">{t("رمز الإحالة", "Referral Code")}</p>
                      <p className="text-xs text-muted-foreground font-mono bg-background px-3 py-1.5 rounded-md inline-block">
                        {selectedUser.referralCode}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyReferralCode(selectedUser.referralCode!)}
                      className="gap-2"
                    >
                      <Copy className="w-3 h-3" />
                      {t("نسخ", "Copy")}
                    </Button>
                  </div>
                </div>
              )}

              {/* Point Transactions */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  {t("سجل النقاط", "Points History")}
                </h4>
                <ScrollArea className="h-[200px] rounded-lg border">
                  {userDetails?.transactions?.length > 0 ? (
                    <div className="p-4 space-y-2">
                      {userDetails.transactions.map((txn: any) => (
                        <div key={txn.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">
                              {language === "ar" ? txn.descriptionAr : txn.descriptionEn}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(txn.createdAt, "dd/MM/yyyy HH:mm", {
                                locale: language === "ar" ? ar : enUS,
                              })}
                            </p>
                          </div>
                          <div className={cn("font-bold", txn.points > 0 ? "text-emerald-600" : "text-red-600")}>
                            {txn.points > 0 ? "+" : ""}
                            {txn.points}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      {t("لا توجد معاملات", "No transactions")}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Referrals */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  {t("الإحالات", "Referrals")}
                </h4>
                <ScrollArea className="h-[200px] rounded-lg border">
                  {userDetails?.referrals?.length > 0 ? (
                    <div className="p-4 space-y-2">
                      {userDetails.referrals.map((ref: any) => (
                        <div key={ref.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{ref.referredUserName}</p>
                            <p className="text-xs text-muted-foreground">{ref.referredUserEmail}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(ref.createdAt, "dd/MM/yyyy HH:mm", {
                                locale: language === "ar" ? ar : enUS,
                              })}
                            </p>
                          </div>
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />+{ref.pointsAwarded} {t("نقطة", "pts")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      {t("لا توجد إحالات", "No referrals")}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Orders */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-purple-500" />
                  {t("الطلبات", "Orders")}
                </h4>
                <ScrollArea className="h-[200px] rounded-lg border">
                  {userDetails?.orders?.length > 0 ? (
                    <div className="p-4 space-y-2">
                      {userDetails.orders.map((order: any) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">
                              {t("طلب", "Order")} #{order.id.slice(0, 8)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(order.createdAt, "dd/MM/yyyy HH:mm", {
                                locale: language === "ar" ? ar : enUS,
                              })}
                            </p>
                          </div>
                          <div className="text-end">
                            <Badge
                              variant="outline"
                              className={cn(
                                order.status === "delivered" && "bg-emerald-100 text-emerald-700",
                                order.status === "shipped" && "bg-blue-100 text-blue-700",
                                order.status === "processing" && "bg-amber-100 text-amber-700",
                                order.status === "pending" && "bg-slate-100 text-slate-700",
                              )}
                            >
                              {order.status}
                            </Badge>
                            <p className="font-bold text-sm mt-1">
                              {order.total?.toLocaleString()} {t("ج.م", "EGP")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      {t("لا توجد طلبات", "No orders")}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button
                  className="flex-1 gap-2"
                  onClick={() => {
                    if (selectedUser) {
                      openChatWithUser(selectedUser.id, selectedUser.displayName)
                      setSelectedUser(null)
                    }
                  }}
                >
                  <MessageSquare className="w-4 h-4" />
                  {t("فتح الدردشة", "Open Chat")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
