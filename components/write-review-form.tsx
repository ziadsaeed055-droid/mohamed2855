"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface WriteReviewFormProps {
  productId: string
  productName: string
  onSubmit: (data: {
    rating: number
    title: string
    comment: string
    images?: string[]
  }) => Promise<void>
  onCancel?: () => void
}

export function WriteReviewForm({ productId, productName, onSubmit, onCancel }: WriteReviewFormProps) {
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!title.trim() || !comment.trim()) {
      setError("يرجى ملء العنوان والتعليق")
      return
    }

    if (title.length < 5 || title.length > 100) {
      setError("العنوان يجب أن يكون بين 5 و 100 حرف")
      return
    }

    if (comment.length < 20 || comment.length > 1000) {
      setError("التعليق يجب أن يكون بين 20 و 1000 حرف")
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        rating,
        title,
        comment,
        images: images.length > 0 ? images : undefined,
      })
    } catch (err) {
      setError("حدث خطأ في إرسال التقييم")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>اكتب تقييمك</CardTitle>
        <CardDescription>{productName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">التقييم</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={cn("transition-transform hover:scale-110")}
              >
                <Star
                  className={cn(
                    "h-8 w-8",
                    star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
                  )}
                />
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {rating === 5 && "ممتاز"}
            {rating === 4 && "جيد جداً"}
            {rating === 3 && "جيد"}
            {rating === 2 && "متوسط"}
            {rating === 1 && "سيء"}
          </p>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            العنوان
          </label>
          <Input
            id="title"
            placeholder="عنوان التقييم (5-100 حرف)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground">{title.length}/100</p>
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <label htmlFor="comment" className="text-sm font-medium">
            التعليق
          </label>
          <Textarea
            id="comment"
            placeholder="شارك تجربتك (20-1000 حرف)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            rows={5}
          />
          <p className="text-xs text-muted-foreground">{comment.length}/1000</p>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">صور (اختياري)</label>
          <div className="flex gap-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 hover:border-gray-400">
              <Upload className="h-4 w-4" />
              <span className="text-sm">أضف صور</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt="Preview" className="h-16 w-16 rounded object-cover" />
                  <button
                    onClick={() => handleRemoveImage(i)}
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {/* Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading ? "جاري الإرسال..." : "إرسال التقييم"}
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              إلغاء
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
