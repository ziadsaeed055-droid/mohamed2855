"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Facebook,
  Instagram,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Percent,
  Sun,
  ShoppingBag,
  Heart,
  Package,
  Settings,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Truck,
  Shield,
  Headphones,
  ShieldCheck,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { CATEGORIES } from "@/lib/types"
import { useState } from "react"
import { cn } from "@/lib/utils"

const SMART_SECTIONS = [
  {
    id: "new-arrivals",
    nameAr: "جديدنا",
    nameEn: "New Arrivals",
    href: "/new-arrivals",
    icon: Sparkles,
  },
  {
    id: "best-sellers",
    nameAr: "الأكثر مبيعًا",
    nameEn: "Best Sellers",
    href: "/best-sellers",
    icon: TrendingUp,
  },
  {
    id: "offers",
    nameAr: "العروض",
    nameEn: "Offers",
    href: "/offers",
    icon: Percent,
  },
  {
    id: "seasonal",
    nameAr: "موسمي",
    nameEn: "Seasonal",
    href: "/seasonal",
    icon: Sun,
  },
]

export function Footer() {
  const { t, language } = useLanguage()
  const [openSections, setOpenSections] = useState<string[]>([])
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setOpenSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  const toggleCategory = (catId: string) => {
    setExpandedCategory((prev) => (prev === catId ? null : catId))
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  }

  return (
    <footer className="relative text-slate-300 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop&q=60"
          alt=""
          fill
          className="object-cover"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/95 via-[#0d1f3c]/92 to-[#060e1a]/98" />
      </div>

      {/* Animated Particles */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-blue-400/20"
            style={{ left: `${20 + i * 15}%`, top: `${10 + i * 18}%` }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Wave Separator */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-[2]">
        <svg className="relative block w-full h-10" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <motion.path
            d="M0,50L80,53C160,56,320,62,480,60C640,58,800,48,960,46C1120,44,1280,50,1360,53L1440,56L1440,0L0,0Z"
            fill="currentColor"
            className="text-background"
            animate={{
              d: [
                "M0,50L80,53C160,56,320,62,480,60C640,58,800,48,960,46C1120,44,1280,50,1360,53L1440,56L1440,0L0,0Z",
                "M0,46L80,48C160,50,320,54,480,52C640,50,800,42,960,40C1120,38,1280,42,1360,44L1440,46L1440,0L0,0Z",
                "M0,50L80,53C160,56,320,62,480,60C640,58,800,48,960,46C1120,44,1280,50,1360,53L1440,56L1440,0L0,0Z",
              ],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </div>

      <div className="container mx-auto px-4 py-14 md:py-20 relative z-10">
        {/* Main Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-10 md:gap-12 pb-12 border-b border-white/10"
        >
          {/* Brand Column */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <div className="space-y-3">
              <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                <Image
                  src="/images/image.png"
                  alt="Seven Blue"
                  width={160}
                  height={80}
                  className="opacity-90 brightness-110"
                />
              </motion.div>
              <div className="flex items-center gap-2 text-blue-400 font-light">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span className="text-xs tracking-wide">{t("للأناقة والجودة", "For Excellence")}</span>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed text-sm font-light max-w-md">
              {t(
                "سفن بلو - براند ملابس راقية مصري متخصص في تقديم أفضل الأزياء العصرية بجودة عالية. نفخر بتقديم تجربة تسوق فريدة عبر الإنترنت مع خدمة توصيل سريعة في جميع أنحاء مصر.",
                "Seven Blue - An Egyptian premium clothing brand specializing in providing the finest modern fashion with high quality. We pride ourselves on offering a unique online shopping experience with fast delivery service across Egypt.",
              )}
            </p>

            {/* Contact Info */}
            <div className="space-y-2.5">
              <motion.a
                whileHover={{ x: language === "ar" ? -4 : 4 }}
                href="tel:01500550388"
                className="flex items-center gap-2.5 text-slate-400 hover:text-blue-400 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:border-blue-500/30 transition-all">
                  <Phone className="h-3.5 w-3.5 text-blue-400" />
                </div>
                <span dir="ltr" className="font-light text-sm">015 00550388</span>
              </motion.a>

              <motion.a
                whileHover={{ x: language === "ar" ? -4 : 4 }}
                href="mailto:seven_blue1978@gmail.com"
                className="flex items-center gap-2.5 text-slate-400 hover:text-blue-400 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:border-blue-500/30 transition-all">
                  <Mail className="h-3.5 w-3.5 text-blue-400" />
                </div>
                <span className="break-all font-light text-sm">seven_blue1978@gmail.com</span>
              </motion.a>

              <div className="flex items-start gap-2.5 text-slate-400">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-blue-400" />
                </div>
                <span className="font-light text-sm">{t("جمهورية مصر العربية", "Arab Republic of Egypt")}</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="pt-3">
              <p className="text-xs text-slate-500 font-light mb-2.5">{t("تابعنا على", "Follow Us")}</p>
              <div className="flex gap-2.5">
                {[
                  { href: "https://www.facebook.com/sevenblueonlinestore", icon: Facebook, hoverBg: "hover:bg-blue-500", hoverShadow: "hover:shadow-blue-500/30" },
                  { href: "https://www.instagram.com/sevenblue_1978", icon: Instagram, hoverBg: "hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-600", hoverShadow: "hover:shadow-pink-500/30" },
                  { href: "https://wa.me/201500550388", icon: MessageCircle, hoverBg: "hover:bg-green-500", hoverShadow: "hover:shadow-green-500/30" },
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 hover:border-transparent hover:text-white hover:shadow-lg",
                      social.hoverBg,
                      social.hoverShadow
                    )}
                    whileHover={{ scale: 1.1, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <social.icon className="h-4 w-4" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Links - Desktop */}
          <motion.div variants={itemVariants} className="hidden md:block">
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2 text-white">
              <ShoppingBag className="w-4 h-4 text-blue-400" />
              {t("روابط سريعة", "Quick Links")}
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: t("الرئيسية", "Home"), icon: ArrowRight },
                { href: "/shop", label: t("المتجر", "Shop"), icon: ArrowRight },
                { href: "/about", label: t("من نحن", "About Us"), icon: ArrowRight },
                { href: "/contact", label: t("تواصل معنا", "Contact Us"), icon: ArrowRight },
                { href: "/wishlist", label: t("المفضلة", "Wishlist"), icon: Heart },
                { href: "/cart", label: t("السلة", "Cart"), icon: ShoppingBag },
                { href: "/profile", label: t("حسابي", "My Account"), icon: Package },
                { href: "/dashboard", label: t("لوحة التحكم", "Dashboard"), icon: Settings },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-blue-400 transition-all flex items-center gap-1.5 group text-sm font-light hover:translate-x-1"
                  >
                    <link.icon className={cn("w-3 h-3 opacity-50 group-hover:opacity-100 transition-all", language === "ar" && link.icon === ArrowRight ? "rotate-180" : "")} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Smart Sections - Desktop */}
          <motion.div variants={itemVariants} className="hidden md:block">
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2 text-white">
              <Sparkles className="w-4 h-4 text-blue-400" />
              {t("الأقسام الذكية", "Smart Sections")}
            </h3>
            <ul className="space-y-2.5">
              {SMART_SECTIONS.map((section) => (
                <li key={section.id}>
                  <Link
                    href={section.href}
                    className="text-slate-400 hover:text-blue-400 transition-all flex items-center gap-1.5 group text-sm font-light hover:translate-x-1"
                  >
                    <section.icon className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                    {t(section.nameAr, section.nameEn)}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Categories with Subcategories Dropdown - Desktop */}
          <motion.div variants={itemVariants} className="hidden md:block">
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2 text-white">
              <Package className="w-4 h-4 text-blue-400" />
              {t("الأقسام", "Categories")}
            </h3>
            <ul className="space-y-1">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className="w-full text-slate-400 hover:text-blue-400 transition-all flex items-center justify-between gap-1.5 group text-sm font-light py-1.5"
                  >
                    <Link href={`/shop?category=${cat.id}`} className="flex items-center gap-1.5 hover:text-blue-400">
                      <ChevronRight
                        className={cn(
                          "w-3 h-3 opacity-50 group-hover:opacity-100 transition-all",
                          language === "ar" ? "rotate-180" : "",
                        )}
                      />
                      {t(cat.nameAr, cat.nameEn)}
                    </Link>
                    {cat.subCategories.length > 0 && (
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 text-slate-500 transition-transform duration-200",
                          expandedCategory === cat.id && "rotate-180 text-blue-400",
                        )}
                      />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedCategory === cat.id && cat.subCategories.length > 0 && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className={cn("ps-5 space-y-1 py-1 border-s border-blue-500/20", language === "ar" ? "pe-5 ps-0 border-e border-s-0" : "")}>
                          {cat.subCategories.map((sub) => (
                            <li key={sub.id}>
                              <Link
                                href={`/shop?category=${cat.id}&sub=${sub.id}`}
                                className="text-slate-500 hover:text-blue-400 transition-colors text-xs font-light block py-0.5"
                              >
                                {t(sub.nameAr, sub.nameEn)}
                              </Link>
                            </li>
                          ))}
                        </div>
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Mobile Accordions */}
          <div className="md:hidden space-y-2">
            {/* Quick Links Mobile */}
            <div className="border-b border-white/10">
              <button
                onClick={() => toggleSection("links")}
                className="w-full flex items-center justify-between py-3 text-left"
              >
                <span className="font-medium text-sm flex items-center gap-2 text-white">
                  <ShoppingBag className="w-4 h-4 text-blue-400" />
                  {t("روابط سريعة", "Quick Links")}
                </span>
                <ChevronDown
                  className={cn("w-4 h-4 text-slate-500 transition-transform", openSections.includes("links") && "rotate-180")}
                />
              </button>
              <AnimatePresence>
                {openSections.includes("links") && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden space-y-2 pb-3 ps-4"
                  >
                    {[
                      { href: "/", label: t("الرئيسية", "Home") },
                      { href: "/shop", label: t("المتجر", "Shop") },
                      { href: "/about", label: t("من نحن", "About Us") },
                      { href: "/contact", label: t("تواصل معنا", "Contact Us") },
                      { href: "/wishlist", label: t("المفضلة", "Wishlist") },
                      { href: "/cart", label: t("السلة", "Cart") },
                      { href: "/profile", label: t("حسابي", "My Account") },
                      { href: "/dashboard", label: t("لوحة التحكم", "Dashboard") },
                    ].map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="text-slate-400 hover:text-blue-400 transition-colors block text-sm font-light">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Smart Sections Mobile */}
            <div className="border-b border-white/10">
              <button
                onClick={() => toggleSection("smart")}
                className="w-full flex items-center justify-between py-3 text-left"
              >
                <span className="font-medium text-sm flex items-center gap-2 text-white">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  {t("الأقسام الذكية", "Smart Sections")}
                </span>
                <ChevronDown
                  className={cn("w-4 h-4 text-slate-500 transition-transform", openSections.includes("smart") && "rotate-180")}
                />
              </button>
              <AnimatePresence>
                {openSections.includes("smart") && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden space-y-2 pb-3 ps-4"
                  >
                    {SMART_SECTIONS.map((section) => (
                      <li key={section.id}>
                        <Link
                          href={section.href}
                          className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1.5 text-sm font-light"
                        >
                          <section.icon className="w-3 h-3" />
                          {t(section.nameAr, section.nameEn)}
                        </Link>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Categories with Subcategories - Mobile */}
            <div className="border-b border-white/10">
              <button
                onClick={() => toggleSection("categories")}
                className="w-full flex items-center justify-between py-3 text-left"
              >
                <span className="font-medium text-sm flex items-center gap-2 text-white">
                  <Package className="w-4 h-4 text-blue-400" />
                  {t("الأقسام", "Categories")}
                </span>
                <ChevronDown
                  className={cn("w-4 h-4 text-slate-500 transition-transform", openSections.includes("categories") && "rotate-180")}
                />
              </button>
              <AnimatePresence>
                {openSections.includes("categories") && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden pb-3 ps-4 space-y-1"
                  >
                    {CATEGORIES.map((cat) => (
                      <div key={cat.id}>
                        <button
                          onClick={() => toggleCategory(cat.id)}
                          className="w-full flex items-center justify-between py-1.5 text-sm text-slate-400 hover:text-blue-400 transition-colors font-light"
                        >
                          <Link href={`/shop?category=${cat.id}`} className="hover:text-blue-400">
                            {t(cat.nameAr, cat.nameEn)}
                          </Link>
                          {cat.subCategories.length > 0 && (
                            <ChevronDown
                              className={cn(
                                "w-3.5 h-3.5 text-slate-500 transition-transform duration-200",
                                expandedCategory === cat.id && "rotate-180 text-blue-400",
                              )}
                            />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedCategory === cat.id && cat.subCategories.length > 0 && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden ps-4 space-y-1 py-1"
                            >
                              {cat.subCategories.map((sub) => (
                                <li key={sub.id}>
                                  <Link
                                    href={`/shop?category=${cat.id}&sub=${sub.id}`}
                                    className="text-slate-500 hover:text-blue-400 transition-colors text-xs font-light block py-0.5"
                                  >
                                    {t(sub.nameAr, sub.nameEn)}
                                  </Link>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="pt-10 space-y-8"
        >
          {/* Brand Credentials Section */}
          <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 px-6 py-8">
              {/* Tax ID */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex flex-col items-center gap-2.5 text-center group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:border-blue-400/40 transition-all duration-300">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-medium block">
                    {t("الرقم الضريبي", "Tax Number")}
                  </span>
                  <p className="text-xl font-semibold text-white tracking-wide font-mono">
                    259-696-768
                  </p>
                </div>
              </motion.div>

              {/* Commercial Record */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex flex-col items-center gap-2.5 text-center group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:border-indigo-400/40 transition-all duration-300">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-medium block">
                    {t("رقم السجل التجاري", "Commercial Registry")}
                  </span>
                  <p className="text-xl font-semibold text-white tracking-wide font-mono">
                    149369
                  </p>
                </div>
              </motion.div>

              {/* Brand Name */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex flex-col items-center gap-2.5 text-center group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center group-hover:bg-slate-500/20 group-hover:border-slate-400/40 transition-all duration-300">
                  <Sparkles className="w-5 h-5 text-slate-400" />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-medium block">
                    {t("العلامة التجارية", "Brand")}
                  </span>
                  <p className="text-xl font-semibold text-white">
                    {t("براند اون لاين", "Brand Online")}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Store Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-8 border-b border-white/10">
            {[
              {
                icon: Truck,
                title: t("شحن مجاني", "Free Shipping"),
                desc: t("لجميع الطلبات", "On All Orders"),
                color: "text-amber-400",
                bg: "bg-amber-500/10 border-amber-500/20 group-hover:bg-amber-500/20",
              },
              {
                icon: Shield,
                title: t("ضمان الجودة", "Quality Guarantee"),
                desc: t("منتجات أصلية 100%", "100% Authentic"),
                color: "text-blue-400",
                bg: "bg-blue-500/10 border-blue-500/20 group-hover:bg-blue-500/20",
              },
              {
                icon: Headphones,
                title: t("دعم العملاء", "Customer Support"),
                desc: t("متاح 24/7", "Available 24/7"),
                color: "text-emerald-400",
                bg: "bg-emerald-500/10 border-emerald-500/20 group-hover:bg-emerald-500/20",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -2 }}
                className="flex items-center justify-center gap-3 px-4 py-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all group"
              >
                <div className={cn("w-10 h-10 rounded-lg border flex items-center justify-center transition-all", feature.bg)}>
                  <feature.icon className={cn("w-5 h-5", feature.color)} />
                </div>
                <div className="text-start">
                  <p className="text-sm font-medium text-white">{feature.title}</p>
                  <p className="text-xs text-slate-400 font-light">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Copyright & Developer Credit */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-slate-500">
            <p className="text-center md:text-start font-light">
              {"\u00A9"} 2026 Seven Blue. {t("جميع الحقوق محفوظة", "All rights reserved")}.
            </p>
            <p className="text-center md:text-end flex items-center gap-2 font-light">
              <span>{t("تم التصميم والبرمجة بواسطة", "Designed & Developed by")}</span>
              <span className="text-blue-400 font-medium">{t("محمد أيمن", "Mohamed Ayman")}</span>
            </p>
          </div>

          {/* Store Status Badge */}
          <div className="flex justify-center">
            <motion.div
              animate={{ opacity: [0.8, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs"
            >
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="font-light">
                {t("المتجر مفتوح دائمًا - متاح أونلاين", "Always Open - Available Online")}
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
