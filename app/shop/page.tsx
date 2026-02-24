"use client"

import { Suspense } from "react"
import ShopPageContent from "./shop-content"
import ShopLoading from "./loading"

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopLoading />}>
      <ShopPageContent />
    </Suspense>
  )
}
