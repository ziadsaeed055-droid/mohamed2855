"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/contexts/language-context"
import { Share2, Copy, Check, Facebook, MessageCircle } from "lucide-react"
import { toast } from "sonner"

interface WishlistShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wishlistId: string
}

export function WishlistShareDialog({ open, onOpenChange, wishlistId }: WishlistShareDialogProps) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/wishlist/shared/${wishlistId}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success(t("تم نسخ الرابط", "Link copied to clipboard"))
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error(t("فشل النسخ", "Failed to copy"))
    }
  }

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(t("شاهد قائمة أمنياتي على Seven Blue!", "Check out my wishlist on Seven Blue!"))
    window.open(`https://wa.me/?text=${text}%20${encodeURIComponent(shareUrl)}`, "_blank")
  }

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank")
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t("قائمة أمنياتي", "My Wishlist"),
          text: t("شاهد قائمة أمنياتي على Seven Blue!", "Check out my wishlist on Seven Blue!"),
          url: shareUrl
        })
      } catch (error) {
        console.log("Share cancelled")
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            {t("مشاركة قائمة الأمنيات", "Share Wishlist")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Copy Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("رابط المشاركة", "Share Link")}
            </label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="shrink-0 bg-transparent"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("مشاركة عبر", "Share via")}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={shareOnWhatsApp}
                variant="outline"
                className="gap-2 bg-transparent"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button
                onClick={shareOnFacebook}
                variant="outline"
                className="gap-2 bg-transparent"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </Button>
              {navigator.share && (
                <Button
                  onClick={shareNative}
                  variant="outline"
                  className="col-span-2 gap-2 bg-transparent"
                >
                  <Share2 className="w-4 h-4" />
                  {t("مشاركة", "Share")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
