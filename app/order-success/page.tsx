"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { CheckCircle, Home, ShoppingBag } from "lucide-react"

export default function OrderSuccessPage() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const { t } = useLanguage()

  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-32 pb-16 min-h-[70vh] flex items-center">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-lg mx-auto animate-scale-in">
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              {t("تم الطلب بنجاح!", "Order Placed Successfully!")}
            </h1>

            <p className="text-muted-foreground mb-8 text-lg">
              {t(
                "شكراً لك! تم استلام طلبك وسيتم التواصل معك قريباً لتأكيد التفاصيل.",
                "Thank you! Your order has been received and we will contact you soon to confirm the details.",
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg" variant="outline">
                  <Home className="h-5 w-5 me-2" />
                  {t("الرئيسية", "Home")}
                </Button>
              </Link>
              <Link href="/shop">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <ShoppingBag className="h-5 w-5 me-2" />
                  {t("متابعة التسوق", "Continue Shopping")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
