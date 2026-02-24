"use client"

import { Bell, X, Trash2, Check, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLanguage } from "@/contexts/language-context"
import { useNotifications } from "@/contexts/notification-context"
import { NotificationItem } from "./notification-item"
import { cn } from "@/lib/utils"

interface NotificationsPanelProps {
  open: boolean
  onClose: () => void
}

export function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  const { t, language } = useLanguage()
  const { notifications, unreadCount, isLoading, error, markAllAsRead, deleteAllNotifications, refreshNotifications } =
    useNotifications()

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className={cn(
          "fixed top-16 z-50 w-[400px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border overflow-hidden",
          language === "ar" ? "left-4 md:left-auto md:right-4" : "right-4 md:right-auto md:left-4",
        )}
        style={{
          animation: "slideIn 0.3s ease-out",
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d3b66] to-[#1a5490] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">{t("الإشعارات", "Notifications")}</h3>
                <p className="text-sm text-white/70">
                  {unreadCount > 0
                    ? t(`${unreadCount} إشعار جديد`, `${unreadCount} new`)
                    : t("لا توجد إشعارات جديدة", "All caught up")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={refreshNotifications}
                className="rounded-full text-white hover:bg-white/20 h-9 w-9"
                title={t("تحديث", "Refresh")}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full text-white hover:bg-white/20 h-9 w-9"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="h-[450px]">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0d3b66]" />
              <p className="mt-4 text-sm text-muted-foreground">{t("جاري التحميل...", "Loading...")}</p>
            </div>
          ) : error ? (
            <div className="p-10 text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-amber-500" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{t("حدث خطأ", "Error occurred")}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("لم نتمكن من تحميل الإشعارات", "Could not load notifications")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshNotifications}
                  className="mt-4 gap-2 bg-transparent"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t("إعادة المحاولة", "Try again")}
                </Button>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-10 text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
                <Bell className="h-10 w-10 text-slate-300" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{t("لا توجد إشعارات", "No notifications")}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("ستظهر هنا عند وصول إشعارات جديدة", "New notifications will appear here")}
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t p-3 flex gap-2 bg-slate-50">
            <Button
              size="sm"
              variant="outline"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex-1 gap-2 text-xs bg-white hover:bg-slate-100 border-slate-200 rounded-xl h-10"
            >
              <Check className="h-4 w-4" />
              {t("تعيين الكل كمقروء", "Mark all as read")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={deleteAllNotifications}
              className="flex-1 gap-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 bg-white rounded-xl h-10"
            >
              <Trash2 className="h-4 w-4" />
              {t("حذف الكل", "Clear all")}
            </Button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  )
}
