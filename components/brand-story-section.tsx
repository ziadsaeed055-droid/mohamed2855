"use client"

import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react"

export function BrandStorySection() {
  const { t, language } = useLanguage()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <section
      ref={ref}
      className="py-20 lg:py-32 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none">
        <div className="absolute top-20 start-10 w-72 h-72 bg-[#0d3b66] rounded-full blur-3xl" />
        <div className="absolute bottom-20 end-10 w-96 h-96 bg-amber-400 rounded-full blur-3xl" />
      </div>

      <div className="container px-4 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
        >
          {/* Content Side */}
          <motion.div variants={itemVariants} className="space-y-8">
            {/* Badge */}
            <motion.div variants={itemVariants} className="inline-flex">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#0d3b66]/10 to-amber-400/10 border border-[#0d3b66]/20">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-[#0d3b66]">{t("من نحن", "Who We Are")}</span>
              </div>
            </motion.div>

            {/* Main Title */}
            <motion.h2
              variants={itemVariants}
              className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <span className="block text-[#0d3b66] mb-2">{t("سيفن بلو", "Seven Blue")}</span>
              <span className="block bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 bg-clip-text text-transparent">
                {t("ارتداءٌ لك", "Wearing for You")}
              </span>
            </motion.h2>

            {/* Story */}
            <motion.div variants={itemVariants} className="space-y-4">
              <p className="text-lg text-slate-700 leading-relaxed">
                {t(
                  "سيفن بلو ليست مجرد متجر ملابس، بل رحلة بدأت من شغف حقيقي بالأناقة والجودة.",
                  "Seven Blue isn't just a clothing store, it's a journey born from genuine passion for elegance and quality.",
                )}
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                {t(
                  "نؤمن أن الموضة ليست مجرد ملابس ترتديها، بل هوية تعكس شخصيتك وتحكي قصتك.",
                  "We believe fashion isn't just clothes you wear, but an identity reflecting your personality and telling your story.",
                )}
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                {t(
                  "مع سيفن بلو، أنت لا تشتري قطعة، بل تستثمر في نفسك وثقتك وحضورك.",
                  "With Seven Blue, you're not buying a piece, you're investing in yourself, your confidence, and your presence.",
                )}
              </p>
            </motion.div>

            {/* Timeline Indicators */}
            <motion.div variants={itemVariants} className="flex items-center gap-6 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#0d3b66]">2020</div>
                <div className="text-sm text-slate-600">{t("التأسيس", "Founded")}</div>
              </div>
              <div className="h-12 w-px bg-gradient-to-b from-[#0d3b66] to-amber-400" />
              <div className="text-center">
                <div className="text-3xl font-bold text-[#0d3b66]">10K+</div>
                <div className="text-sm text-slate-600">{t("عميل راضٍ", "Happy Clients")}</div>
              </div>
              <div className="h-12 w-px bg-gradient-to-b from-[#0d3b66] to-amber-400" />
              <div className="text-center">
                <div className="text-3xl font-bold text-[#0d3b66]">500+</div>
                <div className="text-sm text-slate-600">{t("منتج حصري", "Exclusive Products")}</div>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div variants={itemVariants}>
              <Button
                size="lg"
                className="group bg-gradient-to-r from-[#0d3b66] to-[#1a4a7a] hover:from-[#1a4a7a] hover:to-[#0d3b66] text-white px-8 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                {t("اعرف قصتنا", "Know Our Story")}
                {language === "ar" ? (
                  <ArrowLeft className="w-5 h-5 ms-2 group-hover:-translate-x-1 transition-transform" />
                ) : (
                  <ArrowRight className="w-5 h-5 ms-2 group-hover:translate-x-1 transition-transform" />
                )}
              </Button>
            </motion.div>
          </motion.div>

          {/* Visual Side - Logo & Design */}
          <motion.div variants={logoVariants} className="relative">
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Decorative rings */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-[#0d3b66]/20"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute inset-8 rounded-full border-2 border-amber-400/30"
                animate={{
                  scale: [1, 1.08, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              />

              {/* Logo Container */}
              <div className="absolute inset-16 bg-gradient-to-br from-white via-slate-50 to-blue-50 rounded-full shadow-2xl flex items-center justify-center p-8 border-4 border-white">
                <motion.div
                  className="relative w-full h-full"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ duration: 0.4 }}
                >
                  <Image
                    src="/images/605811209-122158818428830285-7412234705201285219-n-removebg-preview.png"
                    alt="Seven Blue Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </motion.div>
              </div>

              {/* Floating elements */}
              <motion.div
                className="absolute -top-4 -start-4 w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full shadow-lg flex items-center justify-center"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -end-4 w-20 h-20 bg-gradient-to-br from-[#0d3b66] to-[#1a4a7a] rounded-full shadow-lg"
                animate={{
                  y: [0, 10, 0],
                  rotate: [0, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 1,
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
