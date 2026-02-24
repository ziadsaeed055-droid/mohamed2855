import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  limit,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
  type UserLoyaltyData,
  type PointTransaction,
  type Referral,
  type Reward,
  type Redemption,
  type LoyaltyTier,
  type PointTransactionType,
  POINTS_CONFIG,
  LOYALTY_TIERS,
  getTierFromPoints,
  generateReferralCode,
  calculatePointsExpiryDate,
  isSameDay,
} from "@/lib/loyalty-types"
import { sendRewardRedeemedNotification } from "@/lib/notification-service"

// ==================== USER LOYALTY DATA ====================

/**
 * Initialize loyalty data for a new user
 */
export async function initializeLoyaltyData(userId: string): Promise<UserLoyaltyData> {
  const referralCode = generateReferralCode(userId)

  const loyaltyData: UserLoyaltyData = {
    totalPoints: POINTS_CONFIG.SIGNUP_BONUS,
    currentTier: "C",
    totalPointsEarned: POINTS_CONFIG.SIGNUP_BONUS,
    totalPointsRedeemed: 0,
    referralCode,
    referralCount: 0,
    joinedLoyaltyAt: new Date(),
  }

  // Update user document with loyalty data
  await setDoc(
    doc(db, "users", userId),
    {
      loyalty: loyaltyData,
      updatedAt: serverTimestamp(),
      referralCode, // Store referral code as a top-level field
    },
    { merge: true },
  )

  // Create signup bonus transaction
  await createPointTransaction(userId, {
    type: "signup",
    points: POINTS_CONFIG.SIGNUP_BONUS,
    balanceAfter: POINTS_CONFIG.SIGNUP_BONUS,
    descriptionAr: "مكافأة التسجيل",
    descriptionEn: "Signup bonus",
  })

  console.log("[v0] Loyalty data initialized for user:", userId)
  return loyaltyData
}

/**
 * Get user's loyalty data
 */
export async function getUserLoyaltyData(userId: string): Promise<UserLoyaltyData | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", userId))
    if (userDoc.exists()) {
      const data = userDoc.data()
      if (data.loyalty) {
        return {
          ...data.loyalty,
          joinedLoyaltyAt: data.loyalty.joinedLoyaltyAt?.toDate?.() || new Date(),
          lastLoginDate: data.loyalty.lastLoginDate?.toDate?.() || undefined,
        } as UserLoyaltyData
      }
    }
    return null
  } catch (error) {
    console.error("[v0] Error getting user loyalty data:", error)
    return null
  }
}

/**
 * Update user's loyalty data
 */
export async function updateUserLoyaltyData(userId: string, updates: Partial<UserLoyaltyData>): Promise<void> {
  try {
    await setDoc(
      doc(db, "users", userId),
      {
        loyalty: updates,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
    console.log("[v0] User loyalty data updated:", userId)
  } catch (error) {
    console.error("[v0] Error updating user loyalty data:", error)
    throw error
  }
}

// ==================== POINTS TRANSACTIONS ====================

/**
 * Create a point transaction record
 */
export async function createPointTransaction(
  userId: string,
  data: Omit<PointTransaction, "id" | "userId" | "createdAt" | "expiresAt"> & { expiresAt?: Date },
): Promise<string> {
  try {
    const transactionData = {
      userId,
      ...data,
      expiresAt: data.type !== "redeem" && data.type !== "expired" ? calculatePointsExpiryDate() : null,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, "pointTransactions"), transactionData)
    console.log("[v0] Point transaction created:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("[v0] Error creating point transaction:", error)
    throw error
  }
}

/**
 * Get user's point transactions history
 */
export async function getUserPointTransactions(userId: string, limitCount = 50): Promise<PointTransaction[]> {
  try {
    const q = query(
      collection(db, "pointTransactions"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount),
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        expiresAt: data.expiresAt?.toDate?.() || undefined,
      } as PointTransaction
    })
  } catch (error) {
    console.error("[v0] Error getting point transactions:", error)
    return []
  }
}

/**
 * Award points to a user
 */
export async function awardPoints(
  userId: string,
  points: number,
  type: PointTransactionType,
  descriptionAr: string,
  descriptionEn: string,
  referenceId?: string,
): Promise<void> {
  try {
    // Get current loyalty data
    const loyaltyData = await getUserLoyaltyData(userId)
    if (!loyaltyData) {
      console.error("[v0] User loyalty data not found")
      return
    }

    const newBalance = loyaltyData.totalPoints + points
    const newTier = getTierFromPoints(newBalance)

    // Update user loyalty data
    await updateUserLoyaltyData(userId, {
      totalPoints: newBalance,
      currentTier: newTier,
      totalPointsEarned: loyaltyData.totalPointsEarned + points,
    })

    // Create transaction record
    await createPointTransaction(userId, {
      type,
      points,
      balanceAfter: newBalance,
      descriptionAr,
      descriptionEn,
      referenceId,
    })

    // Check for tier upgrade
    if (newTier !== loyaltyData.currentTier) {
      await sendTierChangeNotification(userId, loyaltyData.currentTier, newTier)
    }

    console.log("[v0] Points awarded:", { userId, points, newBalance, newTier })
  } catch (error) {
    console.error("[v0] Error awarding points:", error)
    throw error
  }
}

/**
 * Deduct points from a user (for redemption)
 */
export async function deductPoints(
  userId: string,
  points: number,
  descriptionAr: string,
  descriptionEn: string,
  referenceId?: string,
): Promise<boolean> {
  try {
    const loyaltyData = await getUserLoyaltyData(userId)
    if (!loyaltyData || loyaltyData.totalPoints < points) {
      console.error("[v0] Insufficient points")
      return false
    }

    const newBalance = loyaltyData.totalPoints - points
    const newTier = getTierFromPoints(newBalance)

    // Update user loyalty data
    await updateUserLoyaltyData(userId, {
      totalPoints: newBalance,
      currentTier: newTier,
      totalPointsRedeemed: loyaltyData.totalPointsRedeemed + points,
    })

    // Create transaction record
    await createPointTransaction(userId, {
      type: "redeem",
      points: -points,
      balanceAfter: newBalance,
      descriptionAr,
      descriptionEn,
      referenceId,
    })

    console.log("[v0] Points deducted:", { userId, points, newBalance })
    return true
  } catch (error) {
    console.error("[v0] Error deducting points:", error)
    return false
  }
}

// ==================== DAILY LOGIN BONUS ====================

/**
 * Award daily login bonus (once per day)
 */
export async function awardDailyLoginBonus(userId: string): Promise<boolean> {
  try {
    const loyaltyData = await getUserLoyaltyData(userId)
    if (!loyaltyData) {
      console.log("[v0] No loyalty data found for daily login")
      return false
    }

    const today = new Date()

    // Check if already claimed today
    if (loyaltyData.lastLoginDate && isSameDay(loyaltyData.lastLoginDate, today)) {
      console.log("[v0] Daily login already claimed today")
      return false
    }

    // Award daily login points
    await awardPoints(userId, POINTS_CONFIG.DAILY_LOGIN, "daily_login", "مكافأة الدخول اليومي", "Daily login bonus")

    // Update last login date
    await updateUserLoyaltyData(userId, {
      lastLoginDate: today,
    })

    console.log("[v0] Daily login bonus awarded:", userId)
    return true
  } catch (error) {
    console.error("[v0] Error awarding daily login bonus:", error)
    return false
  }
}

// ==================== REFERRAL SYSTEM ====================

/**
 * Get user by referral code
 */
export async function getUserByReferralCode(referralCode: string): Promise<string | null> {
  try {
    console.log("[v0] 🔍 Searching for referral code:", referralCode)
    console.log("[v0] 📊 Query: collection=users, field=referralCode, value=" + referralCode)

    const q = query(collection(db, "users"), where("referralCode", "==", referralCode), limit(1))

    const snapshot = await getDocs(q)
    console.log("[v0] 📝 Query returned", snapshot.docs.length, "document(s)")

    if (snapshot.empty) {
      console.log("[v0] ❌ No user found with referral code:", referralCode)
      console.log("[v0] 💡 Possible reasons:")
      console.log("   1. Referral code doesn't exist")
      console.log("   2. Referral code wasn't saved during signup")
      console.log("   3. Firebase permissions issue")
      return null
    }

    const userId = snapshot.docs[0].id
    const userData = snapshot.docs[0].data()
    console.log("[v0] ✅ Found referrer!")
    console.log("[v0] 👤 Referrer ID:", userId)
    console.log("[v0] 👤 Referrer Name:", userData.displayName || "No name")
    console.log("[v0] 🔗 Stored referralCode:", userData.referralCode)
    return userId
  } catch (error: any) {
    if (error.code === "failed-precondition" || error.message?.includes("index")) {
      console.error(
        "[v0] ❌❌❌ INDEX MISSING! You need to create an index on users.referralCode",
        "\nGo to: Firebase Console → Firestore Database → Indexes → Create Index",
        "\nCollection: users, Field: referralCode (Ascending)",
      )
    }
    console.error("[v0] ❌ Error getting user by referral code:", error)
    console.error("[v0] Error code:", error.code)
    console.error("[v0] Error message:", error.message)
    return null
  }
}

/**
 * Process a referral when new user signs up with referral code
 */
export async function processReferral(
  newUserId: string,
  newUserName: string,
  newUserEmail: string,
  referralCode: string,
): Promise<boolean> {
  console.log("[v0] ========== PROCESS REFERRAL START ==========")
  console.log("[v0] New User ID:", newUserId)
  console.log("[v0] New User Name:", newUserName)
  console.log("[v0] New User Email:", newUserEmail)
  console.log("[v0] Referral Code:", referralCode)
  
  try {
    console.log("[v0] Step 1: Looking up referrer by code...")
    const referrerId = await getUserByReferralCode(referralCode)
    console.log("[v0] Step 1 Result - Referrer ID:", referrerId || "NOT FOUND")

    if (!referrerId) {
      console.error("[v0] ❌ FAILED: No referrer found with code:", referralCode)
      return false
    }
    
    if (referrerId === newUserId) {
      console.error("[v0] ❌ FAILED: Self-referral detected")
      return false
    }

    console.log("[v0] Step 2: Fetching referrer data...")
    const referrerDoc = await getDoc(doc(db, "users", referrerId))
    if (!referrerDoc.exists()) {
      console.error("[v0] ❌ FAILED: Referrer document not found")
      return false
    }

    const referrerData = referrerDoc.data()
    const referrerName = referrerData.displayName || "User"
    console.log("[v0] Step 2 Result - Referrer:", referrerName)

    console.log("[v0] Step 3: Creating referral record in referrals collection...")
    const referralData: Omit<Referral, "id"> = {
      referrerId,
      referrerName,
      referredUserId: newUserId,
      referredUserName: newUserName,
      referredUserEmail: newUserEmail,
      pointsAwarded: POINTS_CONFIG.REFERRAL_BONUS,
      status: "completed",
      createdAt: new Date(),
      completedAt: new Date(),
    }

    const referralDoc = await addDoc(collection(db, "referrals"), {
      ...referralData,
      createdAt: serverTimestamp(),
      completedAt: serverTimestamp(),
    })
    console.log("[v0] Step 3 Result - Referral record ID:", referralDoc.id)

    console.log("[v0] Step 4: Awarding", POINTS_CONFIG.REFERRAL_BONUS, "points to referrer...")
    await awardPoints(
      referrerId,
      POINTS_CONFIG.REFERRAL_BONUS,
      "referral_signup",
      `مكافأة إحالة ${newUserName}`,
      `Referral bonus for ${newUserName}`,
    )
    console.log("[v0] Step 4 Result - Points awarded successfully")

    console.log("[v0] Step 5: Updating referrer's referral count...")
    const referrerLoyalty = await getUserLoyaltyData(referrerId)
    if (referrerLoyalty) {
      const newCount = (referrerLoyalty.referralCount || 0) + 1
      await updateUserLoyaltyData(referrerId, {
        referralCount: newCount,
      })
      console.log("[v0] Step 5 Result - Count updated to:", newCount)
    } else {
      console.warn("[v0] Step 5 Warning - Referrer loyalty data not found")
    }

    console.log("[v0] Step 6: Sending notification to referrer...")
    await sendReferralNotification(referrerId, newUserName, POINTS_CONFIG.REFERRAL_BONUS)
    console.log("[v0] Step 6 Result - Notification sent")

    console.log("[v0] ========== PROCESS REFERRAL SUCCESS ==========")
    return true
  } catch (error: any) {
    console.error("[v0] ========== PROCESS REFERRAL FAILED ==========")
    console.error("[v0] Error Type:", error?.constructor?.name)
    console.error("[v0] Error Code:", error?.code)
    console.error("[v0] Error Message:", error?.message)
    console.error("[v0] Full Error:", error)
    return false
  }
}

/**
 * Get user's referrals
 */
export async function getUserReferrals(userId: string): Promise<Referral[]> {
  try {
    const q = query(collection(db, "referrals"), where("referrerId", "==", userId), orderBy("createdAt", "desc"))

    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        completedAt: data.completedAt?.toDate?.() || undefined,
      } as Referral
    })
  } catch (error) {
    console.error("[v0] Error getting user referrals:", error)
    return []
  }
}

/**
 * Get all referrals (for admin)
 */
export async function getAllReferrals(limitCount = 100): Promise<Referral[]> {
  try {
    const q = query(collection(db, "referrals"), orderBy("createdAt", "desc"), limit(limitCount))

    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        completedAt: data.completedAt?.toDate?.() || undefined,
      } as Referral
    })
  } catch (error) {
    console.error("[v0] Error getting all referrals:", error)
    return []
  }
}

/**
 * Get top referrers
 */
export async function getTopReferrers(limitCount = 10): Promise<
  Array<{
    userId: string
    userName: string
    referralCount: number
    totalPointsEarned: number
  }>
> {
  try {
    // Get all users with referral count > 0
    const q = query(
      collection(db, "users"),
      where("loyalty.referralCount", ">", 0),
      orderBy("loyalty.referralCount", "desc"),
      limit(limitCount),
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        userId: doc.id,
        userName: data.displayName || "User",
        referralCount: data.loyalty?.referralCount || 0,
        totalPointsEarned: data.loyalty?.totalPointsEarned || 0,
      }
    })
  } catch (error) {
    console.error("[v0] Error getting top referrers:", error)
    return []
  }
}

// ==================== REWARDS SYSTEM ====================

/**
 * Get all rewards
 */
export async function getAllRewards(activeOnly = true): Promise<Reward[]> {
  try {
    let q = query(collection(db, "rewards"), orderBy("pointsRequired", "asc"))

    if (activeOnly) {
      q = query(collection(db, "rewards"), where("isActive", "==", true), orderBy("pointsRequired", "asc"))
    }

    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      } as Reward
    })
  } catch (error) {
    console.error("[v0] Error getting rewards:", error)
    return []
  }
}

/**
 * Create a new reward (admin)
 */
export async function createReward(reward: Omit<Reward, "id" | "createdAt" | "updatedAt">): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "rewards"), {
      ...reward,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    console.log("[v0] Reward created:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("[v0] Error creating reward:", error)
    throw error
  }
}

/**
 * Update a reward (admin)
 */
export async function updateReward(rewardId: string, updates: Partial<Reward>): Promise<void> {
  try {
    await updateDoc(doc(db, "rewards", rewardId), {
      ...updates,
      updatedAt: serverTimestamp(),
    })
    console.log("[v0] Reward updated:", rewardId)
  } catch (error) {
    console.error("[v0] Error updating reward:", error)
    throw error
  }
}

/**
 * Delete a reward (admin)
 */
export async function deleteReward(rewardId: string): Promise<void> {
  try {
    await updateDoc(doc(db, "rewards", rewardId), {
      isActive: false,
      updatedAt: serverTimestamp(),
    })
    console.log("[v0] Reward deactivated:", rewardId)
  } catch (error) {
    console.error("[v0] Error deleting reward:", error)
    throw error
  }
}

// ==================== REDEMPTION SYSTEM ====================

/**
 * Redeem a reward
 */
export async function redeemReward(userId: string, rewardId: string): Promise<string> {
  try {
    // Get reward details
    const rewardDoc = await getDoc(doc(db, "rewards", rewardId))
    if (!rewardDoc.exists()) {
      throw new Error("Reward not found")
    }

    const rewardData = rewardDoc.data() as Reward
    const loyaltyData = await getUserLoyaltyData(userId)

    if (!loyaltyData) {
      throw new Error("Loyalty data not found")
    }

    if (loyaltyData.totalPoints < rewardData.pointsRequired) {
      throw new Error("Insufficient points")
    }

    // Deduct points
    await deductPoints(
      userId,
      rewardData.pointsRequired,
      "reward_redemption",
      `استبدال ${rewardData.nameAr}`,
      `Redeemed ${rewardData.nameEn}`,
    )

    // Create redemption record
    const redemptionData: Omit<Redemption, "id"> = {
      userId,
      rewardId,
      rewardName: rewardData.nameAr,
      rewardNameEn: rewardData.nameEn,
      pointsUsed: rewardData.pointsRequired,
      status: "pending",
      createdAt: new Date(),
    }

    const redemptionDoc = await addDoc(collection(db, "redemptions"), {
      ...redemptionData,
      createdAt: serverTimestamp(),
    })

    try {
      await sendRewardRedeemedNotification(userId, rewardData.nameAr, rewardData.nameEn, rewardData.pointsRequired)
      console.log("[v0] Reward redeemed notification sent")
    } catch (notificationError) {
      console.error("[v0] Failed to send reward notification:", notificationError)
    }

    console.log("[v0] Reward redeemed:", redemptionDoc.id)
    return redemptionDoc.id
  } catch (error) {
    console.error("[v0] Error redeeming reward:", error)
    throw error
  }
}

/**
 * Get user's redemptions
 */
export async function getUserRedemptions(userId: string): Promise<Redemption[]> {
  try {
    const q = query(collection(db, "redemptions"), where("userId", "==", userId), orderBy("createdAt", "desc"))

    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        fulfilledAt: data.fulfilledAt?.toDate?.() || undefined,
      } as Redemption
    })
  } catch (error) {
    console.error("[v0] Error getting user redemptions:", error)
    return []
  }
}

/**
 * Get all redemptions (for admin)
 */
export async function getAllRedemptions(limitCount = 100): Promise<Redemption[]> {
  try {
    const q = query(collection(db, "redemptions"), orderBy("createdAt", "desc"), limit(limitCount))

    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        fulfilledAt: data.fulfilledAt?.toDate?.() || undefined,
      } as Redemption
    })
  } catch (error) {
    console.error("[v0] Error getting all redemptions:", error)
    return []
  }
}

/**
 * Update redemption status (admin)
 */
export async function updateRedemptionStatus(
  redemptionId: string,
  status: "pending" | "fulfilled" | "cancelled",
  adminNotes?: string,
): Promise<void> {
  try {
    const updates: any = {
      status,
      updatedAt: serverTimestamp(),
    }

    if (status === "fulfilled") {
      updates.fulfilledAt = serverTimestamp()
    }

    if (adminNotes) {
      updates.adminNotes = adminNotes
    }

    await updateDoc(doc(db, "redemptions", redemptionId), updates)
    console.log("[v0] Redemption status updated:", redemptionId)
  } catch (error) {
    console.error("[v0] Error updating redemption status:", error)
    throw error
  }
}

// ==================== NOTIFICATIONS ====================

/**
 * Send tier change notification
 */
async function sendTierChangeNotification(userId: string, oldTier: LoyaltyTier, newTier: LoyaltyTier): Promise<void> {
  try {
    const isUpgrade = LOYALTY_TIERS[newTier].minPoints > LOYALTY_TIERS[oldTier].minPoints
    const tierInfo = LOYALTY_TIERS[newTier]

    await addDoc(collection(db, "notifications"), {
      userId,
      type: isUpgrade ? "tier_upgrade" : "tier_downgrade",
      titleAr: isUpgrade ? "مبروك! تمت ترقية مستواك" : "تم تغيير مستوى عضويتك",
      titleEn: isUpgrade ? "Congratulations! You've been upgraded" : "Your tier has changed",
      messageAr: isUpgrade
        ? `تم ترقيتك إلى ${tierInfo.nameAr}! استمتع بمزايا جديدة.`
        : `مستواك الجديد هو ${tierInfo.nameAr}.`,
      messageEn: isUpgrade
        ? `You've been upgraded to ${tierInfo.nameEn}! Enjoy new benefits.`
        : `Your new tier is ${tierInfo.nameEn}.`,
      actionUrl: "/profile?tab=rewards",
      isRead: false,
      createdAt: serverTimestamp(),
    })
    console.log("[v0] Tier change notification sent")
  } catch (error) {
    console.error("[v0] Error sending tier notification:", error)
  }
}

/**
 * Send referral success notification
 */
async function sendReferralNotification(
  userId: string,
  referredUserName: string,
  pointsAwarded: number,
): Promise<void> {
  try {
    await addDoc(collection(db, "notifications"), {
      userId,
      type: "referral_success",
      titleAr: "إحالة ناجحة!",
      titleEn: "Successful Referral!",
      messageAr: `قام ${referredUserName} بالتسجيل باستخدام رابط الإحالة الخاص بك! حصلت على ${pointsAwarded} نقاط.`,
      messageEn: `${referredUserName} signed up using your referral link! You earned ${pointsAwarded} points.`,
      actionUrl: "/profile?tab=rewards",
      isRead: false,
      createdAt: serverTimestamp(),
    })
    console.log("[v0] Referral notification sent")
  } catch (error) {
    console.error("[v0] Error sending referral notification:", error)
  }
}

/**
 * Send points earned notification
 */
export async function sendPointsEarnedNotification(
  userId: string,
  points: number,
  reason: string,
  reasonEn: string,
): Promise<void> {
  try {
    await addDoc(collection(db, "notifications"), {
      userId,
      type: "points_earned",
      titleAr: "حصلت على نقاط!",
      titleEn: "You earned points!",
      messageAr: `حصلت على ${points} نقاط مقابل ${reason}.`,
      messageEn: `You earned ${points} points for ${reasonEn}.`,
      actionUrl: "/profile?tab=rewards",
      isRead: false,
      createdAt: serverTimestamp(),
    })
    console.log("[v0] Points earned notification sent")
  } catch (error) {
    console.error("[v0] Error sending points notification:", error)
  }
}

/**
 * Check and notify about expiring points
 */
export async function checkExpiringPoints(userId: string): Promise<void> {
  try {
    const loyaltyData = await getUserLoyaltyData(userId)
    if (!loyaltyData) return

    // Check if we already notified in the last 7 days
    if (loyaltyData.lastPointsExpiryNotification) {
      const daysSinceNotification = Math.floor(
        (Date.now() - loyaltyData.lastPointsExpiryNotification.getTime()) / (1000 * 60 * 60 * 24),
      )
      if (daysSinceNotification < POINTS_CONFIG.EXPIRY_WARNING_DAYS) return
    }

    // Get transactions that will expire soon
    const warningDate = new Date()
    warningDate.setDate(warningDate.getDate() + POINTS_CONFIG.EXPIRY_WARNING_DAYS)

    const q = query(
      collection(db, "pointTransactions"),
      where("userId", "==", userId),
      where("expiresAt", "<=", warningDate),
      where("expiresAt", ">", new Date()),
    )

    const snapshot = await getDocs(q)
    if (snapshot.empty) return

    let expiringPoints = 0
    snapshot.docs.forEach((doc) => {
      const data = doc.data()
      if (data.points > 0) {
        expiringPoints += data.points
      }
    })

    if (expiringPoints > 0) {
      await addDoc(collection(db, "notifications"), {
        userId,
        type: "points_expiring",
        titleAr: "نقاطك على وشك الانتهاء!",
        titleEn: "Your points are expiring soon!",
        messageAr: `لديك ${expiringPoints} نقاط ستنتهي صلاحيتها خلال ${POINTS_CONFIG.EXPIRY_WARNING_DAYS} أيام. استبدلها الآن!`,
        messageEn: `You have ${expiringPoints} points expiring in ${POINTS_CONFIG.EXPIRY_WARNING_DAYS} days. Redeem them now!`,
        actionUrl: "/profile?tab=rewards",
        isRead: false,
        createdAt: serverTimestamp(),
      })

      await updateUserLoyaltyData(userId, {
        lastPointsExpiryNotification: new Date(),
      })

      console.log("[v0] Expiring points notification sent:", expiringPoints)
    }
  } catch (error) {
    console.error("[v0] Error checking expiring points:", error)
  }
}

// ==================== REFERRAL LINK HELPERS ====================

/**
 * Generate the full referral URL
 */
export function generateReferralUrl(referralCode: string): string {
  // This will work with any domain since we use window.location.origin
  if (typeof window !== "undefined") {
    return `${window.location.origin}/auth?ref=${referralCode}`
  }
  return `/auth?ref=${referralCode}`
}
