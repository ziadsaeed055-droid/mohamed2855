"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import {
  type UserLoyaltyData,
  type PointTransaction,
  type Referral,
  type Reward,
  type Redemption,
  LOYALTY_TIERS,
  generateReferralUrl,
  generateReferralCode,
} from "@/lib/loyalty-types"
import {
  getUserLoyaltyData,
  initializeLoyaltyData,
  getUserPointTransactions,
  getUserReferrals,
  getAllRewards,
  getUserRedemptions,
  redeemReward,
  awardDailyLoginBonus,
  checkExpiringPoints,
} from "@/lib/loyalty-service"

interface LoyaltyContextType {
  // State
  loyaltyData: UserLoyaltyData | null
  transactions: PointTransaction[]
  referrals: Referral[]
  rewards: Reward[]
  redemptions: Redemption[]
  isLoading: boolean
  error: string | null

  // Computed
  referralUrl: string
  tierInfo: (typeof LOYALTY_TIERS)[keyof typeof LOYALTY_TIERS] | null
  pointsToNextTier: number
  nextTierName: string

  // Actions
  refreshLoyaltyData: () => Promise<void>
  refreshTransactions: () => Promise<void>
  refreshReferrals: () => Promise<void>
  refreshRewards: () => Promise<void>
  refreshRedemptions: () => Promise<void>
  handleRedeemReward: (rewardId: string) => Promise<{ success: boolean; message: string; redemptionId?: string }>
  claimDailyBonus: () => Promise<boolean>
}

const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined)

export function LoyaltyProvider({ children }: { children: React.ReactNode }) {
  const { user, firebaseUser } = useAuth()

  const [loyaltyData, setLoyaltyData] = useState<UserLoyaltyData | null>(null)
  const [transactions, setTransactions] = useState<PointTransaction[]>([])
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initAttempted, setInitAttempted] = useState(false)

  const referralUrl = loyaltyData
    ? generateReferralUrl(loyaltyData.referralCode)
    : user?.id
      ? generateReferralUrl(generateReferralCode(user.id))
      : ""

  const tierInfo = loyaltyData ? LOYALTY_TIERS[loyaltyData.currentTier] : LOYALTY_TIERS.C

  const getNextTierInfo = () => {
    if (!loyaltyData) return { pointsToNextTier: LOYALTY_TIERS.B.minPoints, nextTierName: LOYALTY_TIERS.B.nameAr }

    const currentTier = loyaltyData.currentTier
    const currentPoints = loyaltyData.totalPoints

    if (currentTier === "A") {
      return { pointsToNextTier: 0, nextTierName: "" }
    }

    if (currentTier === "C") {
      return {
        pointsToNextTier: Math.max(0, LOYALTY_TIERS.B.minPoints - currentPoints),
        nextTierName: LOYALTY_TIERS.B.nameAr,
      }
    }

    if (currentTier === "B") {
      return {
        pointsToNextTier: Math.max(0, LOYALTY_TIERS.A.minPoints - currentPoints),
        nextTierName: LOYALTY_TIERS.A.nameAr,
      }
    }

    return { pointsToNextTier: 0, nextTierName: "" }
  }

  const { pointsToNextTier, nextTierName } = getNextTierInfo()

  // Refresh loyalty data
  const refreshLoyaltyData = useCallback(async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      setError(null)

      let data = await getUserLoyaltyData(user.id)

      // Initialize if not exists
      if (!data && !initAttempted) {
        console.log("[v0] Initializing loyalty data for user:", user.id)
        setInitAttempted(true)
        try {
          data = await initializeLoyaltyData(user.id)
          console.log("[v0] Loyalty data initialized successfully")
        } catch (initError) {
          console.error("[v0] Error initializing loyalty data:", initError)
          data = {
            totalPoints: 3,
            currentTier: "C",
            totalPointsEarned: 3,
            totalPointsRedeemed: 0,
            referralCode: generateReferralCode(user.id),
            referralCount: 0,
            joinedLoyaltyAt: new Date(),
          }
        }
      }

      if (data) {
        setLoyaltyData(data)
        console.log("[v0] Loyalty data loaded:", data)
      }
    } catch (err) {
      console.error("[v0] Error refreshing loyalty data:", err)
      setError("فشل تحميل بيانات الولاء")
      if (!loyaltyData && user?.id) {
        setLoyaltyData({
          totalPoints: 0,
          currentTier: "C",
          totalPointsEarned: 0,
          totalPointsRedeemed: 0,
          referralCode: generateReferralCode(user.id),
          referralCount: 0,
          joinedLoyaltyAt: new Date(),
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, initAttempted, loyaltyData])

  // Refresh transactions
  const refreshTransactions = useCallback(async () => {
    if (!user?.id) return

    try {
      const data = await getUserPointTransactions(user.id)
      setTransactions(data)
      console.log("[v0] Transactions loaded:", data.length)
    } catch (err) {
      console.error("[v0] Error refreshing transactions:", err)
    }
  }, [user?.id])

  // Refresh referrals
  const refreshReferrals = useCallback(async () => {
    if (!user?.id) return

    try {
      const data = await getUserReferrals(user.id)
      setReferrals(data)
      console.log("[v0] Referrals loaded:", data.length)
    } catch (err) {
      console.error("[v0] Error refreshing referrals:", err)
    }
  }, [user?.id])

  // Refresh rewards
  const refreshRewards = useCallback(async () => {
    try {
      const data = await getAllRewards(true)
      setRewards(data)
      console.log("[v0] Rewards loaded:", data.length)
    } catch (err) {
      console.error("[v0] Error refreshing rewards:", err)
    }
  }, [])

  // Refresh redemptions
  const refreshRedemptions = useCallback(async () => {
    if (!user?.id) return

    try {
      const data = await getUserRedemptions(user.id)
      setRedemptions(data)
      console.log("[v0] Redemptions loaded:", data.length)
    } catch (err) {
      console.error("[v0] Error refreshing redemptions:", err)
    }
  }, [user?.id])

  // Redeem a reward
  const handleRedeemReward = useCallback(
    async (rewardId: string) => {
      if (!user?.id || !user?.displayName || !user?.email) {
        return { success: false, message: "يجب تسجيل الدخول أولاً" }
      }

      const result = await redeemReward(user.id, user.displayName, user.email, rewardId)

      if (result.success) {
        await refreshLoyaltyData()
        await refreshRedemptions()
        await refreshRewards()
      }

      return result
    },
    [user?.id, user?.displayName, user?.email, refreshLoyaltyData, refreshRedemptions, refreshRewards],
  )

  // Claim daily login bonus
  const claimDailyBonus = useCallback(async () => {
    if (!user?.id) return false

    try {
      const success = await awardDailyLoginBonus(user.id)

      if (success) {
        await refreshLoyaltyData()
        await refreshTransactions()
      }

      return success
    } catch (err) {
      console.error("[v0] Error claiming daily bonus:", err)
      return false
    }
  }, [user?.id, refreshLoyaltyData, refreshTransactions])

  // Initialize on user change
  useEffect(() => {
    if (user?.id && firebaseUser) {
      setInitAttempted(false)
      refreshLoyaltyData()
      refreshRewards()
    } else {
      setLoyaltyData(null)
      setTransactions([])
      setReferrals([])
      setRedemptions([])
      setInitAttempted(false)
    }
  }, [user?.id, firebaseUser])

  // Check expiring points on mount
  useEffect(() => {
    if (user?.id && loyaltyData) {
      checkExpiringPoints(user.id).catch((err) => {
        console.error("[v0] Error checking expiring points:", err)
      })
    }
  }, [user?.id, loyaltyData])

  return (
    <LoyaltyContext.Provider
      value={{
        loyaltyData,
        transactions,
        referrals,
        rewards,
        redemptions,
        isLoading,
        error,
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
      }}
    >
      {children}
    </LoyaltyContext.Provider>
  )
}

export function useLoyalty() {
  const context = useContext(LoyaltyContext)
  if (!context) {
    throw new Error("useLoyalty must be used within LoyaltyProvider")
  }
  return context
}
