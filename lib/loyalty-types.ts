// Loyalty System Types and Interfaces

// Loyalty Tier System
export type LoyaltyTier = "A" | "B" | "C"

export const LOYALTY_TIERS = {
  C: {
    id: "C",
    nameAr: "المستوى البرونزي",
    nameEn: "Bronze Tier",
    minPoints: 0,
    maxPoints: 499,
    color: "#CD7F32",
    bgColor: "bg-amber-100",
    textColor: "text-amber-800",
    borderColor: "border-amber-300",
    benefits: {
      ar: ["ترحيب حار بانضمامك", "نقاط عند كل تسجيل دخول"],
      en: ["Warm welcome", "Points on every login"],
    },
  },
  B: {
    id: "B",
    nameAr: "المستوى الفضي",
    nameEn: "Silver Tier",
    minPoints: 500,
    maxPoints: 1499,
    color: "#C0C0C0",
    bgColor: "bg-slate-100",
    textColor: "text-slate-700",
    borderColor: "border-slate-400",
    benefits: {
      ar: ["خصم 5% على الطلبات", "أولوية في الدعم الفني", "وصول مبكر للعروض"],
      en: ["5% discount on orders", "Priority support", "Early access to deals"],
    },
  },
  A: {
    id: "A",
    nameAr: "المستوى الذهبي",
    nameEn: "Gold Tier",
    minPoints: 1500,
    maxPoints: Number.POSITIVE_INFINITY,
    color: "#FFD700",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    borderColor: "border-yellow-400",
    benefits: {
      ar: ["خصم 10% على الطلبات", "شحن مجاني", "هدايا حصرية", "دعم VIP"],
      en: ["10% discount on orders", "Free shipping", "Exclusive gifts", "VIP support"],
    },
  },
} as const

// Point Transaction Types
export type PointTransactionType =
  | "signup" // 3 points
  | "daily_login" // 1 point
  | "referral_signup" // Points for referring someone
  | "purchase" // Points from purchases
  | "redeem" // Points spent on rewards
  | "expired" // Expired points
  | "admin_add" // Admin added points
  | "admin_remove" // Admin removed points

export interface PointTransaction {
  id: string
  userId: string
  type: PointTransactionType
  points: number // Positive for earned, negative for spent
  balanceAfter: number
  descriptionAr: string
  descriptionEn: string
  referenceId?: string // Order ID, Referral ID, Reward ID, etc.
  expiresAt?: Date // When these points expire
  createdAt: Date
}

// Referral System
export interface Referral {
  id: string
  referrerId: string // User who shared the link
  referrerName: string
  referredUserId: string // User who signed up
  referredUserName: string
  referredUserEmail: string
  pointsAwarded: number
  status: "pending" | "completed" | "cancelled"
  createdAt: Date
  completedAt?: Date
}

// Reward/Gift in Points Store
export interface Reward {
  id: string
  nameAr: string
  nameEn: string
  descriptionAr: string
  descriptionEn: string
  imageUrl: string
  pointsRequired: number
  quantity: number // Available quantity
  isActive: boolean
  category: "discount" | "product" | "voucher" | "experience"
  value?: number // For discounts/vouchers - the actual value
  createdAt: Date
  updatedAt: Date
}

// Redemption Record
export interface Redemption {
  id: string
  userId: string
  userName: string
  userEmail: string
  rewardId: string
  rewardNameAr: string
  rewardNameEn: string
  rewardImageUrl: string
  pointsSpent: number
  pointsBalanceAfter: number
  status: "pending" | "fulfilled" | "cancelled"
  adminNotes?: string
  createdAt: Date
  fulfilledAt?: Date
}

// User Loyalty Data (stored in users collection)
export interface UserLoyaltyData {
  totalPoints: number
  currentTier: LoyaltyTier
  totalPointsEarned: number // Lifetime earned
  totalPointsRedeemed: number // Lifetime redeemed
  referralCode: string // Unique referral code (short ID)
  referralCount: number // Number of successful referrals
  lastLoginDate?: Date // For daily login bonus tracking
  lastPointsExpiryNotification?: Date // Last time we notified about expiring points
  joinedLoyaltyAt: Date
}

// Points Configuration
export const POINTS_CONFIG = {
  SIGNUP_BONUS: 3,
  DAILY_LOGIN: 1,
  REFERRAL_BONUS: 5, // Points for the referrer
  REFERRED_BONUS: 3, // Points for the new user (same as signup)
  POINTS_PER_PURCHASE: 1, // Points per 100 EGP spent
  POINTS_EXPIRY_MONTHS: 6,
  EXPIRY_WARNING_DAYS: 7,
} as const

// Notification Types for Loyalty
export type LoyaltyNotificationType =
  | "points_earned"
  | "points_expiring"
  | "tier_upgrade"
  | "tier_downgrade"
  | "reward_redeemed"
  | "referral_success"

// Helper function to determine tier from points
export function getTierFromPoints(points: number): LoyaltyTier {
  if (points >= LOYALTY_TIERS.A.minPoints) return "A"
  if (points >= LOYALTY_TIERS.B.minPoints) return "B"
  return "C"
}

// Helper function to generate referral code
export function generateReferralCode(userId: string): string {
  // Use first 8 characters of userId as base
  const base = userId.slice(0, 8).toUpperCase()
  return `SB${base}`
}

// Helper function to calculate points expiry date
export function calculatePointsExpiryDate(): Date {
  const expiryDate = new Date()
  expiryDate.setMonth(expiryDate.getMonth() + POINTS_CONFIG.POINTS_EXPIRY_MONTHS)
  return expiryDate
}

// Helper to check if two dates are the same day
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

// Helper function to generate the full referral URL
export function generateReferralUrl(referralCode: string): string {
  // This will work with any domain since we use window.location.origin
  if (typeof window !== "undefined") {
    return `${window.location.origin}/auth?ref=${referralCode}`
  }
  return `/auth?ref=${referralCode}`
}
