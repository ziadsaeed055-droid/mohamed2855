"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/contexts/language-context"
import { Send, CheckCircle } from "lucide-react"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const { t } = useLanguage()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      setEmail("")

      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#faa307", "#0d3b66", "#ffffff"],
      })

      // Reset after 3 seconds
      setTimeout(() => setSubmitted(false), 3000)
    }
  }

  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-accent/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-accent text-sm tracking-widest uppercase mb-4 block animate-fade-in">
            {t("ابقَ على اطلاع", "Stay Updated")}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6 animate-slide-up">
            {t("اشترك في نشرتنا البريدية", "Subscribe to Our Newsletter")}
          </h2>
          <p className="text-primary-foreground/80 mb-10 animate-slide-up animation-delay-100">
            {t(
              "احصل على أحدث العروض والتصاميم الجديدة مباشرة في بريدك الإلكتروني",
              "Get the latest offers and new designs directly to your inbox",
            )}
          </p>

          {submitted ? (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="flex items-center justify-center gap-3 text-accent"
            >
              <CheckCircle className="h-6 w-6" />
              <span className="text-lg">{t("شكراً لاشتراكك!", "Thank you for subscribing!")}</span>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onSubmit={handleSubmit}
              className="flex gap-4 max-w-md mx-auto animate-slide-up animation-delay-200"
            >
              <Input
                type="email"
                placeholder={t("بريدك الإلكتروني", "Your email address")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-accent"
                required
              />
              <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground px-6">
                <Send className="h-5 w-5" />
              </Button>
            </motion.form>
          )}
        </div>
      </div>
    </section>
  )
}
