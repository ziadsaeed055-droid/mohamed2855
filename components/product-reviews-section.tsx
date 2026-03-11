"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Review, ProductRating } from "@/lib/types"

interface ProductReviewsSectionProps {
  productId: string
  reviews: Review[] | undefined
  rating: ProductRating | undefined
  onWriteReview?: () => void
}

export function ProductReviewsSection({
  productId,
  reviews = [],
  rating,
  onWriteReview,
}: ProductReviewsSectionProps) {
  const [sortBy, setSortBy] = useState<"helpful" | "recent" | "rating-high" | "rating-low">("recent")
  const [filterRating, setFilterRating] = useState<number | null>(null)

  const sortedReviews = [...(reviews || [])].sort((a, b) => {
    switch (sortBy) {
      case "helpful":
        return b.helpful - a.helpful
      case "rating-high":
        return b.rating - a.rating
      case "rating-low":
        return a.rating - b.rating
      case "recent":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const filteredReviews = filterRating ? sortedReviews.filter((r) => r.rating === filterRating) : sortedReviews

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {rating && (
        <Card>
          <CardHeader>
            <CardTitle>التقييمات والآراء</CardTitle>
            <CardDescription>{rating.totalReviews} تقييم</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Overall Rating */}
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-4xl font-bold">{rating.averageRating.toFixed(1)}</p>
                  <div className="mt-1 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < Math.round(rating.averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
                        )}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">بناءً على {rating.totalReviews} تقييم</p>
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = rating.ratingDistribution[stars] || 0
                  const percentage = rating.totalReviews > 0 ? (count / rating.totalReviews) * 100 : 0

                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="w-12 text-sm">
                        {stars}
                        <Star className="inline h-3 w-3" />
                      </span>
                      <Progress value={percentage} className="flex-1" />
                      <span className="w-10 text-right text-sm text-muted-foreground">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {onWriteReview && (
              <Button className="mt-4 w-full" onClick={onWriteReview}>
                اكتب تقييم
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters and Sort */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={sortBy === "recent" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("recent")}
        >
          الأحدث
        </Button>
        <Button
          variant={sortBy === "helpful" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("helpful")}
        >
          الأكثر مساعدة
        </Button>
        <Button
          variant={sortBy === "rating-high" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("rating-high")}
        >
          الأعلى تقييماً
        </Button>
        <Button
          variant={sortBy === "rating-low" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("rating-low")}
        >
          الأقل تقييماً
        </Button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">لا توجد تقييمات حالياً</p>
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Review Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={review.userPhoto} />
                        <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{review.userName}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-3 w-3",
                                  i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString("ar-SA")}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.verified && (
                      <Badge variant="outline" className="border-green-500 text-green-700">
                        مشتري موثق
                      </Badge>
                    )}
                  </div>

                  {/* Review Content */}
                  <div>
                    <h4 className="font-semibold">{review.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
                  </div>

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2">
                      {review.images.map((img, i) => (
                        <img key={i} src={img} alt="Review" className="h-16 w-16 rounded object-cover" />
                      ))}
                    </div>
                  )}

                  {/* Review Actions */}
                  <div className="flex gap-3 border-t pt-3">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <ThumbsUp className="h-4 w-4" />
                      مفيد ({review.helpful})
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <ThumbsDown className="h-4 w-4" />
                      غير مفيد ({review.unhelpful})
                    </Button>
                  </div>

                  {/* Admin Response */}
                  {review.response && (
                    <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3">
                      <div className="flex items-start gap-2">
                        <MessageCircle className="mt-1 h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-xs font-semibold text-blue-900">رد من المتجر</p>
                          <p className="mt-1 text-sm text-blue-800">{review.response.text}</p>
                          <p className="mt-1 text-xs text-blue-700">
                            {new Date(review.response.timestamp).toLocaleDateString("ar-SA")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
