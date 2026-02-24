"use client"

import type React from "react"

import { Bell, Trash2, Package, Gift, ShoppingBag, UserPlus, LogIn, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { useNotifications } from "@/contexts/notification-context"
import type { Notification } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface NotificationItemProps {
  notification: Notification
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { t, language } = useLanguage()
  const { markAsRead, deleteNotification } = useNotifications()

  const getIcon = () => {
    const iconClass = "h-5 w-5"
    switch (notification.type) {
      case "welcome":
        return <UserPlus className={cn(iconClass, "text-emerald-500")} />
      case "order_confirmed":
        return <ShoppingBag className={cn(iconClass, "text-blue-500")} />
      case "order_status":
        return <Truck className={cn(iconClass, "text-purple-500")} />
      case "promotion":
        return <Gift className={cn(iconClass, "text-orange-500")} />
      case "product":
        return <Package className={cn(iconClass, "text-indigo-500")} />
      case "login":
        return <LogIn className={cn(iconClass, "text-cyan-500")} />
      case "system":
        return <Bell className={cn(iconClass, "text-slate-500")} />
      default:
        return <Bell className={cn(iconClass, "text-slate-500")} />
    }
  }

  const getIconBgColor = () => {
    switch (notification.type) {
      case "welcome":
        return "bg-emerald-100"
      case "order_confirmed":
        return "bg-blue-100"
      case "order_status":
        return "bg-purple-100"
      case "promotion":
        return "bg-orange-100"
      case "product":
        return "bg-indigo-100"
      case "login":
        return "bg-cyan-100"
      case "system":
        return "bg-slate-100"
      default:
        return "bg-slate-100"
    }
  }

  const timeAgo = notification.createdAt
    ? formatDistanceToNow(new Date(notification.createdAt), {
        addSuffix: true,
        locale: language === "ar" ? ar : undefined,
      })
    : ""

  const handleMarkAsRead = async () => {
    if (!notification.isRead) {
      await markAsRead(notification.id)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await deleteNotification(notification.id)
  }

  const title = language === "ar" ? notification.titleAr : notification.titleEn
  const message = language === "ar" ? notification.messageAr : notification.messageEn

  const content = (
    <div
      className={cn(
        "p-4 transition-all hover:bg-slate-50 cursor-pointer group relative",
        !notification.isRead && "bg-blue-50/50",
      )}
      onClick={handleMarkAsRead}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={cn("flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center", getIconBgColor())}>
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p
                  className={cn(
                    "font-semibold text-sm line-clamp-1",
                    notification.isRead ? "text-muted-foreground" : "text-foreground",
                  )}
                >
                  {title}
                </p>
                {!notification.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{message}</p>
              <p className="text-xs text-muted-foreground/70 mt-2">{timeAgo}</p>
            </div>

            {/* Delete Button */}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-100 hover:text-red-600 flex-shrink-0"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  if (notification.actionUrl) {
    return <Link href={notification.actionUrl}>{content}</Link>
  }

  return content
}
