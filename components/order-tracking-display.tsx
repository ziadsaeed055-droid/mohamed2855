"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Truck, CheckCircle2, AlertCircle, MapPin, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Order } from "@/lib/types"

interface OrderTrackingDisplayProps {
  order: Order
  showFullDetails?: boolean
}

const statusConfig: Record<Order["status"], { label: { ar: string; en: string }; color: string; icon: any }> = {
  pending: {
    label: { ar: "قيد الانتظار", en: "Pending" },
    color: "bg-gray-100 text-gray-800",
    icon: AlertCircle,
  },
  processing: {
    label: { ar: "قيد المعالجة", en: "Processing" },
    color: "bg-blue-100 text-blue-800",
    icon: Package,
  },
  shipped: {
    label: { ar: "تم الشحن", en: "Shipped" },
    color: "bg-purple-100 text-purple-800",
    icon: Truck,
  },
  out_for_delivery: {
    label: { ar: "في الطريق", en: "Out for Delivery" },
    color: "bg-yellow-100 text-yellow-800",
    icon: Truck,
  },
  delivered: {
    label: { ar: "تم التسليم", en: "Delivered" },
    color: "bg-green-100 text-green-800",
    icon: CheckCircle2,
  },
  cancelled: {
    label: { ar: "ملغى", en: "Cancelled" },
    color: "bg-red-100 text-red-800",
    icon: AlertCircle,
  },
  refunded: {
    label: { ar: "مسترجع", en: "Refunded" },
    color: "bg-orange-100 text-orange-800",
    icon: AlertCircle,
  },
}

const statusOrder: Order["status"][] = [
  "pending",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
]

export function OrderTrackingDisplay({ order, showFullDetails = false }: OrderTrackingDisplayProps) {
  const config = statusConfig[order.status]
  const Icon = config.icon

  const timeline = order.shippingUpdates || []
  const latestUpdate = timeline[timeline.length - 1]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>
              {order.trackingNumber && (
                <span className="text-sm text-muted-foreground">رقم التتبع: {order.trackingNumber}</span>
              )}
            </CardTitle>
            <CardDescription>رقم الطلب: {order.id}</CardDescription>
          </div>
          <Badge className={config.color}>
            <Icon className="mr-1 h-3 w-3" />
            {config.label.ar}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Timeline */}
        <div className="space-y-3">
          <div className="relative">
            {statusOrder.map((status, index) => {
              const statusConfig = statusConfig[status]
              const StatusIcon = statusConfig.icon
              const isActive = statusOrder.indexOf(order.status) >= index
              const isCompleted = statusOrder.indexOf(order.status) > index

              return (
                <div key={status} className="mb-4 flex gap-4">
                  {/* Timeline dot and line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2",
                        isCompleted
                          ? "border-green-500 bg-green-100"
                          : isActive
                            ? "border-blue-500 bg-blue-100"
                            : "border-gray-300 bg-gray-100",
                      )}
                    >
                      <StatusIcon className="h-4 w-4" />
                    </div>
                    {index < statusOrder.length - 1 && (
                      <div
                        className={cn(
                          "h-8 w-0.5",
                          isCompleted ? "bg-green-500" : isActive ? "bg-blue-500" : "bg-gray-300",
                        )}
                      />
                    )}
                  </div>

                  {/* Timeline content */}
                  <div className="pt-1">
                    <p className="font-medium">{statusConfig.label.ar}</p>
                    {isActive && (
                      <p className="text-sm text-muted-foreground">
                        {timeline.find((u) => u.status === status)?.timestamp
                          ? new Date(timeline.find((u) => u.status === status)?.timestamp || "").toLocaleDateString(
                              "ar-SA",
                            )
                          : order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString("ar-SA")
                            : "قريباً"}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Details */}
        {showFullDetails && (
          <div className="space-y-3 border-t pt-4">
            {order.estimatedDeliveryDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">التاريخ المتوقع للتسليم</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.estimatedDeliveryDate).toLocaleDateString("ar-SA")}
                  </p>
                </div>
              </div>
            )}

            {latestUpdate?.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">الموقع الحالي</p>
                  <p className="text-sm text-muted-foreground">{latestUpdate.location}</p>
                </div>
              </div>
            )}

            {latestUpdate?.notes && (
              <div className="rounded-lg bg-blue-50 p-2">
                <p className="text-sm text-blue-900">{latestUpdate.notes}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
