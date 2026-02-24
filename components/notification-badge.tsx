"use client"

interface NotificationBadgeProps {
  count: number
}

export function NotificationBadge({ count }: NotificationBadgeProps) {
  if (count === 0) return null

  return (
    <span
      className="absolute -top-1 -end-1 bg-destructive text-destructive-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-scale-in"
      style={{ fontSize: "10px" }}
    >
      {count > 99 ? "99+" : count}
    </span>
  )
}
