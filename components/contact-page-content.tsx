"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageSquare, Instagram, Facebook } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export function ContactPageContent() {
  const { t, language } = useLanguage()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await addDoc(collection(db, "contactMessages"), {
        ...formData,
        createdAt: serverTimestamp(),
        status: "new",
      })

      setIsSuccess(true)
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" })

      toast({
        title: t("تم الإرسال بنجاح!", "Sent Successfully!"),
        description: t("سنتواصل معك في أقرب وقت ممكن", "We'll get back to you as soon as possible"),
      })

      setTimeout(() => setIsSuccess(false), 3000)
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: t("خطأ في الإرسال", "Sending Error"),
        description: t("حدث خطأ. يرجى المحاولة مرة أخرى", "An error occurred. Please try again"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="container mx-auto relative z-10"
          >
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block"
              >
                <Image
                  src="/images/605811209-122158818428830285-7412234705201285219-n-removebg-preview.png"
                  alt="Seven Blue"
                  width={120}
                  height={120}
                  className="mx-auto animate-float"
                />
              </motion.div>

              <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary animate-gradient">
                {t("تواصل معنا", "Contact Us")}
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                {t(
                  "نحن هنا للإجابة على جميع استفساراتك وتقديم أفضل خدمة ممكنة",
                  "We're here to answer all your questions and provide the best possible service",
                )}
              </p>
            </div>
          </motion.div>
        </section>

        {/* Contact Content */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-2 space-y-6"
              >
                <div className="bg-card border rounded-2xl p-8 shadow-lg space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <MessageSquare className="w-6 h-6 text-primary" />
                      {t("معلومات التواصل", "Contact Information")}
                    </h2>
                  </div>

                  {/* Phone */}
                  <motion.a
                    href="tel:01500550388"
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-emerald-500/50 transition-shadow">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground mb-1">
                        {t("رقم الهاتف", "Phone Number")}
                      </p>
                      <p className="text-lg font-bold" dir="ltr">
                        015 00550388
                      </p>
                    </div>
                  </motion.a>

                  {/* Email */}
                  <motion.a
                    href="mailto:seven_blue1978@gmail.com"
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-semibold text-sm text-muted-foreground mb-1">
                        {t("البريد الإلكتروني", "Email Address")}
                      </p>
                      <p className="text-lg font-bold break-all">seven_blue1978@gmail.com</p>
                    </div>
                  </motion.a>

                  {/* Address */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground mb-1">{t("العنوان", "Address")}</p>
                      <p className="text-lg font-bold">{t("جمهورية مصر العربية", "Arab Republic of Egypt")}</p>
                    </div>
                  </motion.div>

                  {/* Working Hours */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground mb-1">
                        {t("ساعات العمل", "Working Hours")}
                      </p>
                      <p className="text-lg font-bold">
                        {t("السبت - الخميس: 9 صباحاً - 9 مساءً", "Saturday - Thursday: 9 AM - 9 PM")}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("الجمعة: 2 ظهراً - 9 مساءً", "Friday: 2 PM - 9 PM")}
                      </p>
                    </div>
                  </motion.div>

                  {/* Social Media */}
                  <div className="pt-6 border-t">
                    <p className="font-semibold mb-4">{t("تابعنا على", "Follow Us On")}</p>
                    <div className="flex gap-3">
                      <motion.a
                        href="https://www.facebook.com/sevenblueonlinestore"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 rounded-full bg-[#1877f2] flex items-center justify-center text-white shadow-lg hover:shadow-blue-500/50 transition-shadow"
                      >
                        <Facebook className="w-6 h-6" />
                      </motion.a>
                      <motion.a
                        href="https://www.instagram.com/sevenblue_1978"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] flex items-center justify-center text-white shadow-lg hover:shadow-pink-500/50 transition-shadow"
                      >
                        <Instagram className="w-6 h-6" />
                      </motion.a>
                      <motion.a
                        href="https://wa.me/201500550388"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 rounded-full bg-[#25d366] flex items-center justify-center text-white shadow-lg hover:shadow-green-500/50 transition-shadow"
                      >
                        <MessageSquare className="w-6 h-6" />
                      </motion.a>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-3"
              >
                <div className="bg-card border rounded-2xl p-8 shadow-lg">
                  {isSuccess ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center justify-center py-16 space-y-6"
                    >
                      <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                      </div>
                      <div className="text-center space-y-2">
                        <h3 className="text-2xl font-bold">{t("تم الإرسال بنجاح!", "Sent Successfully!")}</h3>
                        <p className="text-muted-foreground">
                          {t(
                            "شكراً لتواصلك معنا. سنرد عليك في أقرب وقت ممكن.",
                            "Thank you for contacting us. We'll respond as soon as possible.",
                          )}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-2">{t("أرسل لنا رسالة", "Send Us a Message")}</h2>
                        <p className="text-muted-foreground">
                          {t(
                            "املأ النموذج أدناه وسنتواصل معك قريباً",
                            "Fill out the form below and we'll get back to you soon",
                          )}
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="name">{t("الاسم الكامل", "Full Name")} *</Label>
                            <Input
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              required
                              placeholder={t("أدخل اسمك الكامل", "Enter your full name")}
                              className="h-12"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">{t("البريد الإلكتروني", "Email Address")} *</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              placeholder={t("أدخل بريدك الإلكتروني", "Enter your email address")}
                              className="h-12"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="phone">{t("رقم الهاتف", "Phone Number")} *</Label>
                            <Input
                              id="phone"
                              name="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={handleChange}
                              required
                              placeholder={t("أدخل رقم هاتفك", "Enter your phone number")}
                              className="h-12"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="subject">{t("الموضوع", "Subject")} *</Label>
                            <Input
                              id="subject"
                              name="subject"
                              value={formData.subject}
                              onChange={handleChange}
                              required
                              placeholder={t("ما هو موضوع رسالتك؟", "What is your message about?")}
                              className="h-12"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">{t("الرسالة", "Message")} *</Label>
                          <Textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            placeholder={t("اكتب رسالتك هنا...", "Write your message here...")}
                            rows={6}
                            className="resize-none"
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all shadow-lg hover:shadow-xl"
                        >
                          {isSubmitting ? (
                            <span className="flex items-center gap-2">
                              <span className="animate-spin">⏳</span>
                              {t("جاري الإرسال...", "Sending...")}
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Send className="w-5 h-5" />
                              {t("إرسال الرسالة", "Send Message")}
                            </span>
                          )}
                        </Button>
                      </form>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
