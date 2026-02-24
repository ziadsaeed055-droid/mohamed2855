"use client"

import { Bell, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLanguage } from "@/contexts/language-context"
import { useNotifications } from "@/contexts/notification-context"
import { NotificationItem } from "./notification-item"
import { NotificationsDebugPanel } from "./notifications-debug-panel"

export function ProfileNotificationsTab() {
  const { t, language } = useLanguage()
  const { notifications, unreadCount, isLoading, markAllAsRead, deleteAllNotifications } = useNotifications()

  return (
    <div className="space-y-6">
      {/* Debug Panel */}
      <NotificationsDebugPanel />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">{t("الإشعارات", "Notifications")}</h3>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center bg-destructive text-destructive-foreground text-xs w-6 h-6 rounded-full font-bold">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Empty State */}
      {!isLoading && notifications.length === 0 && (
        <Card className="p-12 text-center space-y-3 bg-muted/30">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground">{t("لا توجد إشعارات", "No notifications yet")}</p>
          <p className="text-sm text-muted-foreground">
            {t("سيظهر الإشعارات هنا عند وجود تحديثات", "Notifications will appear here when you have updates")}
          </p>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center p-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      )}

      {/* Notifications List */}
      {!isLoading && notifications.length > 0 && (
        <div className="space-y-3">
          {/* Actions Bar */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex-1 gap-1 text-xs bg-transparent"
            >
              <Check className="h-3.5 w-3.5" />
              {t("اقرأ الكل", "Mark all as read")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={deleteAllNotifications}
              className="flex-1 gap-1 text-xs text-destructive hover:text-destructive bg-transparent"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("حذف الكل", "Clear all")}
            </Button>
          </div>

          {/* Notifications */}
          <Card className="overflow-hidden divide-y">
            <ScrollArea className="h-[600px]">
              {notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </ScrollArea>
          </Card>
        </div>
      )}
    </div>
  )
}
