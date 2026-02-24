import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { CategoriesShowcase } from "@/components/categories-showcase"
import { NewsletterSection } from "@/components/newsletter-section"
import { ChatWidget } from "@/components/chat-widget"
import { FeaturedProductSection } from "@/components/featured-product-section"
import { FlashSaleSection } from "@/components/flash-sale-section"
import { NewArrivalsSection, BestSellersSection, OffersSection, SeasonalSection } from "@/components/smart-sections"
import { FloatingBackToTop } from "@/components/floating-back-to-top"
import { BrandStorySection } from "@/components/brand-story-section"
import { RecentlyViewedSection } from "@/components/recently-viewed-section"
import { CategoriesSection } from "@/components/categories-section"
import { FloatingProductsShowcase } from "@/components/floating-products-showcase"
import { MoodBoardSection } from "@/components/mood-board-section"
import { ColorPaletteFinder } from "@/components/color-palette-finder"
import {
  OrganizationSchema,
  WebsiteSchema,
  StoreSchema,
  LocalBusinessSchema,
} from "@/components/structured-data"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <OrganizationSchema />
      <WebsiteSchema />
      <StoreSchema />
      <LocalBusinessSchema />
      <Header />
      <HeroSection />
      <CategoriesSection />
      <CategoriesShowcase />
      <FeaturedProductSection />
      <FloatingProductsShowcase />
      <NewArrivalsSection />
      <FlashSaleSection />
      <BrandStorySection />
      <OffersSection />
      <BestSellersSection />
      <MoodBoardSection />
      <ColorPaletteFinder />
      <SeasonalSection />
      <RecentlyViewedSection />
      <NewsletterSection />
      <Footer />
      <ChatWidget />
      <FloatingBackToTop />
    </main>
  )
}
