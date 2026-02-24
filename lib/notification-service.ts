import { serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { NotificationType } from "@/lib/types"
import { collection, addDoc } from "firebase/firestore"

interface NotificationData {
  userId: string
  type: NotificationType
  titleAr: string
  titleEn: string
  messageAr: string
  messageEn: string
  actionUrl?: string
  orderData?: any
}

export async function createNotification(data: NotificationData) {
  try {
    console.log("[v0] Creating notification:", {
      userId: data.userId,
      type: data.type,
      titleAr: data.titleAr,
    })

    const notificationData = {
      userId: data.userId,
      type: data.type,
      titleAr: data.titleAr,
      titleEn: data.titleEn,
      messageAr: data.messageAr,
      messageEn: data.messageEn,
      actionUrl: data.actionUrl || null,
      orderData: data.orderData || null,
      isRead: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    console.log("[v0] Notification data to save:", notificationData)

    const notificationRef = await addDoc(collection(db, "notifications"), notificationData)

    console.log("[v0] Notification created successfully with ID:", notificationRef.id)
    return notificationRef.id
  } catch (error: any) {
    console.error("[v0] Error creating notification:", error.code, error.message)
    return null
  }
}

export async function sendWelcomeNotification(userId: string, userName: string) {
  console.log("[v0] Sending welcome notification for user:", userId)
  return createNotification({
    userId,
    type: "welcome",
    titleAr: "مرحباً بك في Seven Blue!",
    titleEn: "Welcome to Seven Blue!",
    messageAr: `أهلاً بك يا ${userName}! نتمنى لك تجربة تسوق ممتعة معنا. حصلت على 3 نقاط كمكافأة تسجيل!`,
    messageEn: `Welcome ${userName}! We're excited to have you with us. You earned 3 points as signup bonus!`,
    actionUrl: "/shop",
  })
}

export async function sendOrderConfirmationNotification(
  userId: string,
  orderId: string,
  orderTotal: number,
  itemCount: number,
) {
  console.log("[v0] Sending order confirmation notification:", {
    userId,
    orderId,
    orderTotal,
    itemCount,
  })

  const shortOrderId = orderId.substring(0, 8).toUpperCase()

  return createNotification({
    userId,
    type: "order_confirmed",
    titleAr: "تم استقبال طلبك بنجاح!",
    titleEn: "Order Received Successfully!",
    messageAr: `تم استقبال طلبك رقم #${shortOrderId}. الإجمالي: ${orderTotal.toFixed(2)} ج.م. عدد المنتجات: ${itemCount}. شكراً لاختيارك لنا!`,
    messageEn: `Your order #${shortOrderId} has been received. Total: ${orderTotal.toFixed(2)} EGP. Items: ${itemCount}. Thank you!`,
    actionUrl: `/profile`,
    orderData: {
      orderId,
      total: orderTotal,
      itemCount,
      timestamp: new Date().toISOString(),
    },
  })
}

export async function sendOrderStatusNotification(userId: string, orderId: string, status: string) {
  console.log("[v0] Sending order status notification:", {
    userId,
    orderId,
    status,
  })

  const shortOrderId = orderId.substring(0, 8).toUpperCase()

  const statusMessages: Record<
    string,
    {
      titleAr: string
      titleEn: string
      messageAr: string
      messageEn: string
    }
  > = {
    pending: {
      titleAr: "طلبك قيد الانتظار",
      titleEn: "Order Pending",
      messageAr: `طلبك رقم #${shortOrderId} قيد الانتظار وسيتم معالجته قريباً.`,
      messageEn: `Your order #${shortOrderId} is pending and will be processed soon.`,
    },
    processing: {
      titleAr: "جاري تجهيز طلبك",
      titleEn: "Order Processing",
      messageAr: `جاري تجهيز طلبك رقم #${shortOrderId}. سيتم شحنه قريباً جداً.`,
      messageEn: `Your order #${shortOrderId} is being prepared. It will be shipped very soon.`,
    },
    shipped: {
      titleAr: "تم شحن طلبك!",
      titleEn: "Order Shipped!",
      messageAr: `تم شحن طلبك رقم #${shortOrderId}! سيصل إليك خلال أيام قليلة.`,
      messageEn: `Your order #${shortOrderId} has been shipped! It will arrive in a few days.`,
    },
    delivered: {
      titleAr: "تم تسليم طلبك بنجاح!",
      titleEn: "Order Delivered!",
      messageAr: `تم تسليم طلبك رقم #${shortOrderId} بنجاح! شكراً لتعاملك معنا.`,
      messageEn: `Your order #${shortOrderId} has been delivered! Thank you for your business.`,
    },
    cancelled: {
      titleAr: "تم إلغاء الطلب",
      titleEn: "Order Cancelled",
      messageAr: `تم إلغاء طلبك رقم #${shortOrderId}. إذا كنت تريد معرفة السبب، يرجى التواصل معنا.`,
      messageEn: `Your order #${shortOrderId} has been cancelled. Please contact us for details.`,
    },
  }

  const msgData = statusMessages[status] || statusMessages.processing

  return createNotification({
    userId,
    type: "order_status",
    titleAr: msgData.titleAr,
    titleEn: msgData.titleEn,
    messageAr: msgData.messageAr,
    messageEn: msgData.messageEn,
    actionUrl: `/profile`,
    orderData: {
      orderId,
      status,
      timestamp: new Date().toISOString(),
    },
  })
}

export async function sendPromotionNotification(userId: string, promotionTitle: string, promotionMessage: string) {
  console.log("[v0] Sending promotion notification:", { userId, promotionTitle })

  return createNotification({
    userId,
    type: "promotion",
    titleAr: promotionTitle,
    titleEn: promotionTitle,
    messageAr: promotionMessage,
    messageEn: promotionMessage,
    actionUrl: "/shop",
  })
}

export async function sendLoginNotification(userId: string, userName: string) {
  console.log("[v0] Sending login notification:", { userId })

  return createNotification({
    userId,
    type: "login",
    titleAr: "تسجيل دخول جديد",
    titleEn: "New Login",
    messageAr: `تم تسجيل دخولك إلى حسابك بنجاح يا ${userName}.`,
    messageEn: `You have successfully logged in, ${userName}.`,
    actionUrl: "/profile",
  })
}

export async function sendNewProductNotification(
  userId: string,
  productNameAr: string,
  productNameEn: string,
  productId: string,
) {
  console.log("[v0] Sending new product notification:", { userId, productNameAr })

  return createNotification({
    userId,
    type: "new_product",
    titleAr: "منتج جديد متاح!",
    titleEn: "New Product Available!",
    messageAr: `تم إضافة منتج جديد: ${productNameAr}. تحقق منه الآن!`,
    messageEn: `New product added: ${productNameEn}. Check it out now!`,
    actionUrl: `/product/${productId}`,
  })
}

export async function sendRewardRedeemedNotification(
  userId: string,
  rewardNameAr: string,
  rewardNameEn: string,
  pointsUsed: number,
) {
  console.log("[v0] Sending reward redeemed notification:", { userId, rewardNameAr })

  return createNotification({
    userId,
    type: "reward_redeemed",
    titleAr: "تم استبدال المكافأة بنجاح!",
    titleEn: "Reward Redeemed Successfully!",
    messageAr: `تم استبدال ${rewardNameAr} مقابل ${pointsUsed} نقاط. سنتواصل معك قريباً!`,
    messageEn: `${rewardNameEn} redeemed for ${pointsUsed} points. We'll contact you soon!`,
    actionUrl: "/profile?tab=rewards",
  })
}
