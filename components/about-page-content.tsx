"use client"

import { cn } from "@/lib/utils"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Heart, Shield, Users, ShoppingBag, Star, ArrowRight, CheckCircle2, Target, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

interface AboutData {
  hero: {
    titleAr: string
    titleEn: string
    subtitleAr: string
    subtitleEn: string
    descriptionAr: string
    descriptionEn: string
    backgroundImage: string
  }
  story: {
    titleAr: string
    titleEn: string
    contentAr: string
    contentEn: string
    image: string
  }
  timeline: Array<{
    year: string
    titleAr: string
    titleEn: string
    descriptionAr: string
    descriptionEn: string
  }>
  values: Array<{
    icon: string
    titleAr: string
    titleEn: string
    descriptionAr: string
    descriptionEn: string
  }>
  team: Array<{
    name: string
    roleAr: string
    roleEn: string
    image: string
    bio: string
  }>
  stats: {
    products: number
    experience: number
    customers: number
    branches: number
  }
  whyUs: Array<{
    titleAr: string
    titleEn: string
    descriptionAr: string
    descriptionEn: string
  }>
  testimonials: Array<{
    name: string
    rating: number
    commentAr: string
    commentEn: string
    image: string
    date: string
  }>
}

const defaultData: AboutData = {
  hero: {
    titleAr: "رحلة من الشغف إلى التميز",
    titleEn: "A Journey from Passion to Excellence",
    subtitleAr: "Seven Blue - نلبس لك بأناقة",
    subtitleEn: "Seven Blue - Wearing for You",
    descriptionAr: "منذ انطلاقتنا، كان هدفنا واحداً: تقديم أزياء راقية تعكس شخصيتك وتعزز ثقتك بنفسك",
    descriptionEn:
      "Since our launch, our goal has been one: to provide elegant fashion that reflects your personality and boosts your confidence",
    backgroundImage: "/images/605811209-122158818428830285-7412234705201285219-n.jpg",
  },
  story: {
    titleAr: "قصتنا",
    titleEn: "Our Story",
    contentAr:
      "بدأت Seven Blue من حلم بسيط: جعل الموضة الراقية في متناول الجميع. نؤمن بأن الأناقة ليست رفاهية، بل هي حق لكل شخص يسعى للتعبير عن نفسه. نختار كل قطعة بعناية فائقة، نهتم بأدق التفاصيل، ونحرص على تقديم تجربة تسوق استثنائية تجمع بين الجودة والأسعار المنافسة.",
    contentEn:
      "Seven Blue started from a simple dream: making high fashion accessible to everyone. We believe that elegance is not a luxury, but a right for everyone seeking to express themselves. We carefully select each piece, pay attention to the finest details, and strive to provide an exceptional shopping experience that combines quality and competitive prices.",
    image: "/images/605811209-122158818428830285-7412234705201285219-n.jpg",
  },
  timeline: [
    {
      year: "2020",
      titleAr: "البداية",
      titleEn: "The Beginning",
      descriptionAr: "تأسيس Seven Blue كمتجر إلكتروني صغير بمجموعة محدودة من المنتجات",
      descriptionEn: "Seven Blue was founded as a small online store with a limited product collection",
    },
    {
      year: "2021",
      titleAr: "التوسع",
      titleEn: "Expansion",
      descriptionAr: "إضافة فئات جديدة وتوسيع نطاق المنتجات لتلبية احتياجات عملائنا",
      descriptionEn: "Adding new categories and expanding product range to meet our customers' needs",
    },
    {
      year: "2022",
      titleAr: "الانتشار",
      titleEn: "Growth",
      descriptionAr: "افتتاح أول فرع فعلي وزيادة قاعدة العملاء بشكل ملحوظ",
      descriptionEn: "Opening our first physical branch and significantly increasing our customer base",
    },
    {
      year: "2023",
      titleAr: "الريادة",
      titleEn: "Leadership",
      descriptionAr: "أصبحنا واحداً من أبرز المتاجر في مصر مع آلاف العملاء الراضين",
      descriptionEn: "Became one of Egypt's leading stores with thousands of satisfied customers",
    },
  ],
  values: [
    {
      icon: "quality",
      titleAr: "الجودة أولاً",
      titleEn: "Quality First",
      descriptionAr: "نختار كل منتج بعناية فائقة لضمان أعلى معايير الجودة",
      descriptionEn: "We carefully select each product to ensure the highest quality standards",
    },
    {
      icon: "trust",
      titleAr: "الثقة والشفافية",
      titleEn: "Trust & Transparency",
      descriptionAr: "نبني علاقات طويلة الأمد مع عملائنا من خلال الصدق والشفافية",
      descriptionEn: "We build long-term relationships with our customers through honesty and transparency",
    },
    {
      icon: "innovation",
      titleAr: "الابتكار المستمر",
      titleEn: "Continuous Innovation",
      descriptionAr: "نواكب أحدث صيحات الموضة ونبتكر تجارب تسوق جديدة",
      descriptionEn: "We keep up with the latest fashion trends and innovate new shopping experiences",
    },
    {
      icon: "service",
      titleAr: "خدمة عملاء متميزة",
      titleEn: "Excellent Customer Service",
      descriptionAr: "فريقنا متاح دائماً لمساعدتك وضمان رضاك الكامل",
      descriptionEn: "Our team is always available to help you and ensure your complete satisfaction",
    },
  ],
  team: [
    {
      name: "أحمد محمد",
      roleAr: "المؤسس والمدير التنفيذي",
      roleEn: "Founder & CEO",
      image: "/images/605811209-122158818428830285-7412234705201285219-n.jpg",
      bio: "رائد أعمال شغوف بعالم الموضة والتجارة الإلكترونية",
    },
  ],
  stats: {
    products: 500,
    experience: 4,
    customers: 10000,
    branches: 3,
  },
  whyUs: [
    {
      titleAr: "منتجات عالية الجودة",
      titleEn: "High Quality Products",
      descriptionAr: "نختار كل قطعة بعناية من أفضل الموردين",
      descriptionEn: "We carefully select each piece from the best suppliers",
    },
    {
      titleAr: "أسعار تنافسية",
      titleEn: "Competitive Prices",
      descriptionAr: "أفضل الأسعار مع جودة لا تُضاهى",
      descriptionEn: "Best prices with unmatched quality",
    },
    {
      titleAr: "شحن سريع ومجاني",
      titleEn: "Fast & Free Shipping",
      descriptionAr: "نوصل طلبك في أسرع وقت بدون رسوم إضافية",
      descriptionEn: "We deliver your order quickly with no extra fees",
    },
    {
      titleAr: "إرجاع واستبدال مجاني",
      titleEn: "Free Returns & Exchanges",
      descriptionAr: "ضمان استرجاع واستبدال لمدة 14 يوماً",
      descriptionEn: "14-day return and exchange guarantee",
    },
  ],
  testimonials: [
    {
      name: "سارة أحمد",
      rating: 5,
      commentAr: "تجربة تسوق رائعة! المنتجات ذات جودة عالية والتوصيل سريع",
      commentEn: "Amazing shopping experience! High quality products and fast delivery",
      image: "/diverse-customer-group.png",
      date: "2024-01-15",
    },
    {
      name: "محمد علي",
      rating: 5,
      commentAr: "أفضل متجر أونلاين في مصر! خدمة عملاء ممتازة",
      commentEn: "Best online store in Egypt! Excellent customer service",
      image: "/diverse-customer-group.png",
      date: "2024-01-10",
    },
  ],
}

const iconMap: Record<string, any> = {
  quality: Shield,
  trust: Heart,
  innovation: Lightbulb,
  service: Users,
}

function AnimatedCounter({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return

    let startTime: number | null = null
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [end, duration, isInView])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

export function AboutPageContent() {
  const { language, t } = useLanguage()
  const [aboutData, setAboutData] = useState<AboutData>(defaultData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const docRef = doc(db, "settings", "aboutPage")
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setAboutData({ ...defaultData, ...docSnap.data() } as AboutData)
        }
      } catch (error) {
        console.error("Error fetching about data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAboutData()
  }, [])

  if (loading) {
    return null
  }

  const isRTL = language === "ar"

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d3b66]/95 to-[#1a4a7a]/90 z-10" />
        <Image
          src={aboutData.hero.backgroundImage || "/placeholder.svg"}
          alt="Seven Blue"
          fill
          className="object-contain opacity-20"
          priority
        />
        <div className="relative z-20 container mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <Badge className="bg-amber-500 text-slate-900 text-lg px-6 py-2 font-bold">
              {isRTL ? aboutData.hero.subtitleAr : aboutData.hero.subtitleEn}
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold font-serif">
              {isRTL ? aboutData.hero.titleAr : aboutData.hero.titleEn}
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto">
              {isRTL ? aboutData.hero.descriptionAr : aboutData.hero.descriptionEn}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={aboutData.story.image || "/placeholder.svg"}
                alt="Our Story"
                fill
                className="object-contain"
              />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#0d3b66] font-serif">
              {isRTL ? aboutData.story.titleAr : aboutData.story.titleEn}
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed">
              {isRTL ? aboutData.story.contentAr : aboutData.story.contentEn}
            </p>
            <Button asChild size="lg" className="bg-[#0d3b66] hover:bg-[#1a4a7a] text-white">
              <Link href="/products">
                {t("تسوق الآن", "Shop Now")} <ArrowRight className="w-5 h-5 ms-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-gradient-to-br from-slate-100 to-slate-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#0d3b66] font-serif mb-4">
              {t("رحلتنا عبر الزمن", "Our Journey Through Time")}
            </h2>
            <p className="text-lg text-slate-600">{t("من البداية حتى اليوم", "From the beginning until today")}</p>
          </motion.div>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-[#0d3b66] to-amber-500" />
            {aboutData.timeline.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={cn("relative flex items-center mb-12", index % 2 === 0 ? "justify-start" : "justify-end")}
              >
                <div
                  className={cn(
                    "w-5/12 bg-white p-6 rounded-xl shadow-lg border-2 border-slate-200",
                    index % 2 === 0 ? "text-end" : "text-start",
                  )}
                >
                  <Badge className="bg-[#0d3b66] text-white text-lg px-4 py-1 mb-3">{item.year}</Badge>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{isRTL ? item.titleAr : item.titleEn}</h3>
                  <p className="text-slate-600">{isRTL ? item.descriptionAr : item.descriptionEn}</p>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-amber-500 border-4 border-white shadow-lg" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#0d3b66] font-serif mb-4">
            {t("قيمنا ومبادئنا", "Our Values & Principles")}
          </h2>
          <p className="text-lg text-slate-600">{t("ما نؤمن به ونعمل من أجله", "What we believe in and work for")}</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {aboutData.values.map((value, index) => {
            const Icon = iconMap[value.icon] || Target
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center space-y-4 hover:shadow-2xl transition-all duration-300"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#0d3b66] to-[#1a4a7a] flex items-center justify-center">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{isRTL ? value.titleAr : value.titleEn}</h3>
                <p className="text-slate-600">{isRTL ? value.descriptionAr : value.descriptionEn}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-br from-[#0d3b66] to-[#1a4a7a] text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-serif mb-4">
              {t("أرقامنا تتحدث عن نفسها", "Our Numbers Speak for Themselves")}
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="text-5xl md:text-6xl font-bold text-amber-400 mb-2">
                <AnimatedCounter end={aboutData.stats.products} />+
              </div>
              <p className="text-xl text-slate-200">{t("منتج", "Products")}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="text-5xl md:text-6xl font-bold text-amber-400 mb-2">
                <AnimatedCounter end={aboutData.stats.experience} />+
              </div>
              <p className="text-xl text-slate-200">{t("سنوات خبرة", "Years Experience")}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="text-5xl md:text-6xl font-bold text-amber-400 mb-2">
                <AnimatedCounter end={aboutData.stats.customers} />+
              </div>
              <p className="text-xl text-slate-200">{t("عميل راضٍ", "Happy Customers")}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <div className="text-5xl md:text-6xl font-bold text-amber-400 mb-2">
                <AnimatedCounter end={aboutData.stats.branches} />+
              </div>
              <p className="text-xl text-slate-200">{t("فروع", "Branches")}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-24 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#0d3b66] font-serif mb-4">
            {t("لماذا نحن مختلفون؟", "Why Are We Different?")}
          </h2>
          <p className="text-lg text-slate-600">{t("ما يميزنا عن الآخرين", "What sets us apart from others")}</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {aboutData.whyUs.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-xl border-2 border-slate-200 hover:border-[#0d3b66] transition-all duration-300"
            >
              <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">{isRTL ? item.titleAr : item.titleEn}</h3>
              <p className="text-slate-600 text-sm">{isRTL ? item.descriptionAr : item.descriptionEn}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-slate-100 to-slate-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#0d3b66] font-serif mb-4">
              {t("آراء عملائنا", "Customer Reviews")}
            </h2>
            <p className="text-lg text-slate-600">{t("ما يقوله عملاؤنا عنا", "What our customers say about us")}</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {aboutData.testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden">
                    <Image
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                    <div className="flex gap-1">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-slate-700 italic">"{isRTL ? testimonial.commentAr : testimonial.commentEn}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[#0d3b66] to-[#1a4a7a] text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-serif">
              {t("جاهز لتجربة التسوق معنا؟", "Ready to Shop with Us?")}
            </h2>
            <p className="text-xl text-slate-200 max-w-2xl mx-auto">
              {t("اكتشف مجموعتنا الواسعة من المنتجات الراقية", "Discover our wide range of premium products")}
            </p>
            <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-lg px-8">
              <Link href="/products">
                {t("استكشف المنتجات", "Explore Products")} <ShoppingBag className="w-5 h-5 ms-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
