import { Skeleton } from "@/components/ui/skeleton"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-6">
              <Skeleton className="h-10 w-48 mx-auto rounded-full" />
              <Skeleton className="h-16 w-64 mx-auto" />
              <Skeleton className="h-8 w-full max-w-2xl mx-auto" />
              <div className="flex items-center justify-center gap-6 pt-4">
                <Skeleton className="h-10 w-32 rounded-full" />
                <Skeleton className="h-10 w-40 rounded-full" />
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 md:py-12 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            {/* Top Controls Bar */}
            <div className="mb-8 p-4 bg-white rounded-2xl shadow-sm border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-32 rounded-xl" />
                  <Skeleton className="h-6 w-32 rounded" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-44 rounded-xl" />
                  <div className="flex gap-2">
                    <Skeleton className="h-11 w-11 rounded-xl" />
                    <Skeleton className="h-11 w-11 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square rounded-2xl" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1 rounded-xl" />
                    <Skeleton className="h-10 w-10 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
