"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ShoppingBag,
  User,
  Menu,
  Search,
  Heart,
  Settings,
  Globe,
  X,
  Bell,
  Sparkles,
  TrendingUp,
  Percent,
  Sun,
  ChevronRight,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { useRecentlyViewed } from "@/contexts/recently-viewed-context"
import { CATEGORIES } from "@/lib/types"
import { cn } from "@/lib/utils"
import { NotificationBadge } from "@/components/notification-badge"
import { NotificationsPanel } from "@/components/notifications-panel"
import { useNotifications } from "@/contexts/notification-context"
import { CategoriesDropdown } from "@/components/categories-dropdown"

const SMART_SECTIONS = [
  {
    id: "new-arrivals",
    nameAr: "جديدنا",
    nameEn: "New Arrivals",
    href: "/new-arrivals",
    icon: Sparkles,
    color: "text-emerald-500",
  },
  {
    id: "best-sellers",
    nameAr: "الأكثر مبيعًا",
    nameEn: "Best Sellers",
    href: "/best-sellers",
    icon: TrendingUp,
    color: "text-amber-500",
  },
  {
    id: "offers",
    nameAr: "العروض",
    nameEn: "Offers",
    href: "/offers",
    icon: Percent,
    color: "text-red-500",
  },
  {
    id: "seasonal",
    nameAr: "موسمي",
    nameEn: "Seasonal",
    href: "/seasonal",
    icon: Sun,
    color: "text-sky-500",
  },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const { getItemCount } = useCart()
  const { user } = useAuth()
  const { t, language, setLanguage } = useLanguage()
  const { unreadCount } = useNotifications()
  const { recentlyViewed } = useRecentlyViewed()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled ? "bg-card/95 backdrop-blur-xl shadow-lg py-3" : "bg-transparent py-5",
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "rounded-md",
                    isScrolled
                      ? "text-foreground hover:bg-muted"
                      : "text-primary-foreground hover:bg-primary-foreground/10"
                  )}
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side={language === "ar" ? "right" : "left"} 
                className="w-full max-w-sm bg-white dark:bg-slate-950 p-0 overflow-y-auto border-l border-border"
              >
                {/* Header with Logo */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-[#0d3b66] to-[#1a5a99] p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <Image 
                      src="/images/logo.png" 
                      alt="Seven Blue" 
                      width={140} 
                      height={70} 
                      className="h-14 w-auto brightness-0 invert" 
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-white hover:bg-white/10 rounded-full"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <nav className="flex flex-col p-4 space-y-1">
                  {/* القائمة الرئيسية */}
                  <div className="mb-2">
                    <Link
                      href="/"
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 hover:bg-[#0d3b66]/10 hover:text-[#0d3b66] transition-all duration-200 group"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="w-2 h-2 rounded-full bg-[#0d3b66]/0 group-hover:bg-[#0d3b66] transition-all" />
                      <span>{t("الرئيسية", "Home")}</span>
                    </Link>
                    <Link
                      href="/shop"
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 hover:bg-[#0d3b66]/10 hover:text-[#0d3b66] transition-all duration-200 group"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="w-2 h-2 rounded-full bg-[#0d3b66]/0 group-hover:bg-[#0d3b66] transition-all" />
                      <span>{t("المتجر", "Shop")}</span>
                    </Link>
                    <Link
                      href="/about"
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 hover:bg-[#0d3b66]/10 hover:text-[#0d3b66] transition-all duration-200 group"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="w-2 h-2 rounded-full bg-[#0d3b66]/0 group-hover:bg-[#0d3b66] transition-all" />
                      <span>{t("من نحن", "About Us")}</span>
                    </Link>
                    <Link
                      href="/contact"
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 hover:bg-[#0d3b66]/10 hover:text-[#0d3b66] transition-all duration-200 group"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="w-2 h-2 rounded-full bg-[#0d3b66]/0 group-hover:bg-[#0d3b66] transition-all" />
                      <span>{t("تواصل معنا", "Contact Us")}</span>
                    </Link>
                  </div>
                  {/* الأقسام الذكية */}
                  <div className="mt-6 mb-4">
                    <div className="px-4 mb-3">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        {t("الأقسام الذكية", "Smart Sections")}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {SMART_SECTIONS.map((section) => (
                        <Link
                          key={section.id}
                          href={section.href}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-[#0d3b66]/10 hover:to-transparent hover:text-[#0d3b66] transition-all duration-200 group"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <section.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", section.color)} />
                          <span className="flex-1">{t(section.nameAr, section.nameEn)}</span>
                          <ChevronRight className={cn("w-4 h-4 opacity-0 group-hover:opacity-100 transition-all", language === "ar" ? "rotate-180" : "")} />
                        </Link>
                      ))}
                    </div>
                  </div>
                  {/* الأقسام الرئيسية */}
                  <div className="mt-6 mb-4">
                    <div className="px-4 mb-3">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        {t("الأقسام", "Categories")}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {CATEGORIES.map((category) => (
                        <div key={category.id} className="space-y-1">
                          <Link
                            href={`/shop?category=${category.id}`}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-[#0d3b66]/10 hover:text-[#0d3b66] transition-all duration-200 group"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <span className="flex-1">{t(category.nameAr, category.nameEn)}</span>
                            <ChevronRight className={cn("w-4 h-4 opacity-0 group-hover:opacity-100 transition-all", language === "ar" ? "rotate-180" : "")} />
                          </Link>
                          {category.subCategories && (
                            <div className="ps-6 space-y-1">
                              {category.subCategories.map((subCat) => (
                                <Link
                                  key={subCat.id}
                                  href={`/shop?category=${category.id}&subCategory=${subCat.id}`}
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:text-[#0d3b66] dark:hover:text-[#0d3b66] hover:bg-[#0d3b66]/5 transition-all duration-200"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#0d3b66]/40" />
                                  <span>{t(subCat.nameAr, subCat.nameEn)}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>


                  {/* لوحة التحكم */}
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-white bg-gradient-to-r from-[#0d3b66] to-[#1a5a99] hover:shadow-lg transition-all duration-200 group"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings className="h-5 w-5" />
                      <span className="flex-1">{t("لوحة التحكم", "Dashboard")}</span>
                      <ChevronRight className={cn("w-4 h-4 group-hover:translate-x-1 transition-transform", language === "ar" ? "rotate-180" : "")} />
                    </Link>
                  </div>

                  {/* Footer Info */}
                  <div className="mt-auto pt-6 pb-4 px-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      {t("© 2026 Seven Blue. جميع الحقوق محفوظة", "© 2026 Seven Blue. All rights reserved")}
                    </p>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="Seven Blue"
                width={140}
                height={70}
                className={cn(
                  "h-14 w-auto object-contain transition-all duration-300",
                  !isScrolled && "brightness-0 invert",
                )}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link
                href="/"
                className={cn(
                  "text-sm font-medium tracking-wide transition-all hover:text-accent relative group",
                  isScrolled ? "text-foreground" : "text-primary-foreground",
                )}
              >
                {t("الرئيسية", "Home")}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
              </Link>
              <Link
                href="/shop"
                className={cn(
                  "text-sm font-medium tracking-wide transition-all hover:text-accent relative group",
                  isScrolled ? "text-foreground" : "text-primary-foreground",
                )}
              >
                {t("المتجر", "Shop")}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
              </Link>
              <CategoriesDropdown isScrolled={isScrolled} />
              {SMART_SECTIONS.map((section) => (
                <Link
                  key={section.id}
                  href={section.href}
                  className={cn(
                    "text-sm font-medium tracking-wide transition-all hover:text-accent relative group flex items-center gap-1.5",
                    isScrolled ? "text-foreground" : "text-primary-foreground",
                  )}
                >
                  <section.icon className={cn("w-3.5 h-3.5", isScrolled ? section.color : "text-inherit")} />
                  {t(section.nameAr, section.nameEn)}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
                </Link>
              ))}
              <Link
                href="/about"
                className={cn(
                  "text-sm font-medium tracking-wide transition-all hover:text-accent relative group",
                  isScrolled ? "text-foreground" : "text-primary-foreground",
                )}
              >
                {t("من نحن", "About Us")}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
              </Link>
              <Link
                href="/contact"
                className={cn(
                  "text-sm font-medium tracking-wide transition-all hover:text-accent relative group",
                  isScrolled ? "text-foreground" : "text-primary-foreground",
                )}
              >
                {t("تواصل معنا", "Contact Us")}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
              </Link>
              <Link
                href="/dashboard"
                className={cn(
                  "text-sm font-medium tracking-wide transition-all hover:text-accent flex items-center gap-1.5",
                  isScrolled ? "text-foreground" : "text-primary-foreground",
                )}
              >
                <Settings className="h-4 w-4" />
                {t("لوحة التحكم", "Dashboard")}
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
                className={cn(
                  "rounded-full",
                  isScrolled
                    ? "text-foreground hover:bg-muted"
                    : "text-primary-foreground hover:bg-primary-foreground/10",
                )}
              >
                <Globe className="h-5 w-5" />
              </Button>

              {/* Search */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className={cn(
                  "hidden sm:flex rounded-full",
                  isScrolled
                    ? "text-foreground hover:bg-muted"
                    : "text-primary-foreground hover:bg-primary-foreground/10",
                )}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Recently Viewed */}
              <Link href="#recently-viewed">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "relative rounded-md transition-all hover:scale-105",
                    isScrolled
                      ? "text-foreground hover:bg-muted"
                      : "text-primary-foreground hover:bg-primary-foreground/10",
                  )}
                >
                  <Eye className="h-5 w-5" />
                  {recentlyViewed.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                      {recentlyViewed.length}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Wishlist */}
              <Link href="/wishlist">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "relative rounded-md transition-all hover:scale-105",
                    isScrolled
                      ? "text-foreground hover:bg-muted"
                      : "text-primary-foreground hover:bg-primary-foreground/10",
                  )}
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>

              {/* Notifications */}
              {user && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className={cn(
                      "rounded-full relative",
                      isScrolled
                        ? "text-foreground hover:bg-muted"
                        : "text-primary-foreground hover:bg-primary-foreground/10",
                    )}
                  >
                    <Bell className="h-5 w-5" />
                    <NotificationBadge count={unreadCount} />
                  </Button>
                </div>
              )}

              {/* Cart */}
              <Link href="/cart" className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "rounded-full",
                    isScrolled
                      ? "text-foreground hover:bg-muted"
                      : "text-primary-foreground hover:bg-primary-foreground/10",
                  )}
                >
                  <ShoppingBag className="h-5 w-5" />
                  {getItemCount() > 0 && (
                    <span className="absolute -top-1 -end-1 bg-accent text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-scale-in">
                      {getItemCount()}
                    </span>
                  )}
                </Button>
              </Link>

              {/* User */}
              <Link href={user ? "/profile" : "/auth"}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "rounded-full",
                    isScrolled
                      ? "text-foreground hover:bg-muted"
                      : "text-primary-foreground hover:bg-primary-foreground/10",
                  )}
                >
                  {user?.photoURL ? (
                    <Image
                      src={user.photoURL || "/placeholder.svg"}
                      alt={user.displayName || "User"}
                      width={32}
                      height={32}
                      className="rounded-full ring-2 ring-accent"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Panel */}
      <NotificationsPanel open={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl animate-fade-in">
          <div className="container mx-auto px-4 pt-32">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t("ابحث عن منتجات...", "Search for products...")}
                    className="w-full ps-12 h-14 text-lg rounded-full border-2 focus:border-primary"
                    autoFocus
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)} className="rounded-full">
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <p className="text-center text-muted-foreground">
                {t("اكتب للبحث عن المنتجات في المتجر", "Type to search products in the store")}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
