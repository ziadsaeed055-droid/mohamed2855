"use client"

import { useNotifications } from "@/contexts/notification-context"
import { useAuth } from "@/contexts/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, RefreshCw, FileText } from "lucide-react"

export function NotificationsDebugPanel() {
  const { notifications, isLoading, deleteAllNotifications, unreadCount } = useNotifications()
  const { user } = useAuth()

  return (
    <Card className="p-6 bg-muted/50 border-2 border-dashed">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Debug Panel - Notifications</h3>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-background rounded-lg border">
            <p className="text-muted-foreground">User ID:</p>
            <p className="font-mono text-xs break-all">{user?.id || "No user"}</p>
          </div>
          <div className="p-3 bg-background rounded-lg border">
            <p className="text-muted-foreground">Total Notifications:</p>
            <p className="font-bold text-lg">{notifications.length}</p>
          </div>
          <div className="p-3 bg-background rounded-lg border">
            <p className="text-muted-foreground">Unread:</p>
            <p className="font-bold text-lg text-orange-500">{unreadCount}</p>
          </div>
          <div className="p-3 bg-background rounded-lg border">
            <p className="text-muted-foreground">Loading:</p>
            <p className="font-bold">{isLoading ? "Yes" : "No"}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Recent Notifications
            </h4>
            {notifications.length > 0 && (
              <Button variant="destructive" size="sm" onClick={deleteAllNotifications}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No notifications yet</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notifications.slice(0, 10).map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 bg-background rounded-lg border-l-4 ${
                    notif.isRead ? "border-muted" : "border-primary"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs text-muted-foreground mb-1">{notif.type}</p>
                      <p className="font-medium text-sm">{notif.titleEn || notif.titleAr}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{notif.messageEn || notif.messageAr}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                      {notif.orderData && (
                        <p className="text-xs font-mono bg-muted px-2 py-1 rounded mt-2">
                          Order: {JSON.stringify(notif.orderData).substring(0, 100)}...
                        </p>
                      )}
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        notif.isRead ? "bg-muted" : "bg-primary/20 text-primary"
                      }`}
                    >
                      {notif.isRead ? "Read" : "Unread"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-900">
            ℹ️ <strong>Debugging tip:</strong> Check the browser console (F12 → Console) for detailed logs marked with
            [v0]. This panel shows the last 10 notifications.
          </p>
        </div>
      </div>
    </Card>
  )
}
