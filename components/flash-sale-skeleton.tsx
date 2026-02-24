import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export function FlashSaleSkeleton() {
  return (
    <section className="py-16 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="container mx-auto px-4">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        {/* Timer Skeleton */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Skeleton className="h-20 w-20 rounded-xl" />
          <Skeleton className="h-8 w-4" />
          <Skeleton className="h-20 w-20 rounded-xl" />
          <Skeleton className="h-8 w-4" />
          <Skeleton className="h-20 w-20 rounded-xl" />
          <Skeleton className="h-8 w-4" />
          <Skeleton className="h-20 w-20 rounded-xl" />
        </div>

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
