"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Sparkles, Loader2, ShoppingBag, Heart, Package, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  text: string
  sender: "user" | "ai"
  timestamp: Date
}

interface QuickAction {
  icon: React.ElementType
  label: string
  labelEn: string
  action: string
}

export function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hintTimerRef = useRef<NodeJS.Timeout | null>(null)
  const { t, language } = useLanguage()
  const { user } = useAuth()

  // Only show AI Chat if user is NOT authenticated
  // When authenticated, Support Chat (in dashboard) takes over
  const shouldShowAI = !user

  // Show hint after 5 seconds, then repeat every 5 minutes
  useEffect(() => {
    if (!shouldShowAI || isOpen) return

    // Initial hint after 5 seconds
    const initialTimer = setTimeout(() => {
      setShowHint(true)
    }, 5000)

    return () => clearTimeout(initialTimer)
  }, [shouldShowAI, isOpen])

  // Repeat hint every 5 minutes
  useEffect(() => {
    if (!shouldShowAI || isOpen || !showHint) return

    hintTimerRef.current = setInterval(() => {
      setShowHint(true)
      setTimeout(() => setShowHint(false), 5000)
    }, 300000) // 5 minutes

    return () => {
      if (hintTimerRef.current) clearInterval(hintTimerRef.current)
    }
  }, [shouldShowAI, isOpen, showHint])

  const quickActions: QuickAction[] = [
    { icon: ShoppingBag, label: "أريد التسوق", labelEn: "Start Shopping", action: "shopping" },
    { icon: Heart, label: "المنتجات المميزة", labelEn: "Featured Products", action: "featured" },
    { icon: Package, label: "تتبع طلبي", labelEn: "Track Order", action: "track" },
    { icon: HelpCircle, label: "المساعدة", labelEn: "Help", action: "help" },
  ]

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: language === "ar"
          ? "مرحباً! أنا مساعدك الذكي في Seven Blue 👋\n\nكيف يمكنني مساعدتك اليوم؟"
          : "Hello! I'm your smart assistant at Seven Blue 👋\n\nHow can I help you today?",
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, messages.length, language])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleQuickAction = (action: string) => {
    const responses: Record<string, { ar: string; en: string }> = {
      shopping: {
        ar: "رائع! يمكنك استعراض منتجاتنا من خلال:\n\n• المتجر - جميع المنتجات\n• الوافد حديثاً - أحدث المنتجات\n• العروض - خصومات حصرية\n• الأقسام - اختر حسب الفئة\n\nما الذي تبحث عنه بالتحديد؟",
        en: "Great! You can browse our products through:\n\n• Shop - All Products\n• New Arrivals - Latest Items\n• Offers - Exclusive Discounts\n• Categories - Choose by Category\n\nWhat exactly are you looking for?",
      },
      featured: {
        ar: "لدينا مجموعة رائعة من المنتجات المميزة! 🌟\n\n• منتجات حصرية بجودة عالية\n• تصاميم عصرية وأنيقة\n• أسعار تنافسية\n• شحن مجاني لجميع الطلبات\n\nهل تريد رؤية الأكثر مبيعاً؟",
        en: "We have an amazing collection of featured products! 🌟\n\n• Exclusive high-quality items\n• Modern and elegant designs\n• Competitive prices\n• Free shipping on all orders\n\nWould you like to see our best sellers?",
      },
      track: {
        ar: "لتتبع طلبك، تحتاج إلى:\n\n1. رقم الطلب الخاص بك\n2. تسجيل الدخول لحسابك\n3. زيارة صفحة 'طلباتي'\n\nأو يمكنك التواصل مع خدمة العملاء:\n📞 015 00550388",
        en: "To track your order, you need:\n\n1. Your order number\n2. Login to your account\n3. Visit 'My Orders' page\n\nOr contact customer service:\n📞 015 00550388",
      },
      help: {
        ar: "كيف يمكنني مساعدتك؟ 😊\n\n• معلومات عن المنتجات\n• طرق الدفع والشحن\n• سياسة الإرجاع\n• حسابي وطلباتي\n• عروض وخصومات\n\nما الذي تحتاج معرفته؟",
        en: "How can I help you? 😊\n\n• Product information\n• Payment & Shipping methods\n• Return policy\n• My account & orders\n• Offers & discounts\n\nWhat would you like to know?",
      },
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: quickActions.find(qa => qa.action === action)?.[language === "ar" ? "label" : "labelEn"] || "",
      sender: "user",
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[action]?.[language] || responses.help[language],
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1000)
  }

  const handleSendMessage = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // AI Response Logic
    setTimeout(() => {
      const lowercaseInput = input.toLowerCase()
      let response = ""

      // معلومات عن محمد أيمن
      if (lowercaseInput.includes("محمد أيمن") || lowercaseInput.includes("mohamed ayman") || lowercaseInput.includes("مطور") || lowercaseInput.includes("developer") || lowercaseInput.includes("برمج") || lowercaseInput.includes("program")) {
        response = language === "ar"
          ? "🌟 محمد أيمن - المطور المبدع لهذا النظام\n\n👨‍💻 المعلومات الشخصية:\n• العمر: 18 سنة\n• من: مدينة بني سويف، مصر\n• الأول على محافظة بني سويف - شعبة حاسبات\n\n🎓 التعليم:\n• طالب بالكلية المصرية الكورية للتكنولوجيا\n• جامعة بني سويف التكنولوجية\n\n💼 المهارات:\n• مبرمج Full Stack Developer\n• تطوير مواقع إلكترونية\n• تطبيقات الهواتف المحمولة (Mobile Apps)\n• قواعد البيانات (Databases)\n• معه شهادات معتمدة في JavaScript & HTML\n\n✨ هو من صمم وبرمج نظام Seven Blue بالكامل بإتقان واحترافية عالية!"
          : "🌟 Mohamed Ayman - The Creative Developer\n\n👨‍💻 Personal Info:\n• Age: 18 years\n• From: Beni Suef City, Egypt\n• Top of Beni Suef - Computer Science Department\n\n🎓 Education:\n• Student at Egyptian Korean College of Technology\n• Beni Suef Technological University\n\n💼 Skills:\n• Full Stack Developer\n• Web Development\n• Mobile Application Development\n• Database Management\n• Certified in JavaScript & HTML\n\n✨ He designed and programmed Seven Blue system with excellence!"
      } else if (lowercaseInput.includes("سعر") || lowercaseInput.includes("price") || lowercaseInput.includes("كام") || lowercaseInput.includes("how much")) {
        response = language === "ar"
          ? "أسعارنا تنافسية جداً ونوفر عروض وخصومات مستمرة! يمكنك مشاهدة الأسعار على صفحة المنتج مباشرة. هل تبحث عن منتج معين؟"
          : "Our prices are very competitive and we offer continuous deals! You can see prices directly on the product page. Looking for something specific?"
      } else if (lowercaseInput.includes("شحن") || lowercaseInput.includes("shipping") || lowercaseInput.includes("توصيل") || lowercaseInput.includes("delivery")) {
        response = language === "ar"
          ? "🚚 الشحن مجاني لجميع الطلبات!\n\n• التوصيل خلال 3-5 أيام عمل\n• نوصل لجميع أنحاء مصر\n• يمكنك تتبع شحنتك\n\nهل لديك أي استفسار آخر؟"
          : "🚚 Free shipping on all orders!\n\n• Delivery within 3-5 business days\n• We deliver across Egypt\n• Track your shipment\n\nAny other questions?"
      } else if (lowercaseInput.includes("مقاس") || lowercaseInput.includes("size") || lowercaseInput.includes("قياس")) {
        response = language === "ar"
          ? "📏 لدينا جميع المقاسات من S إلى XXL!\n\nيمكنك مشاهدة دليل المقاسات على صفحة المنتج. إذا كنت غير متأكد من المقاس، يمكنك التواصل معنا."
          : "📏 We have all sizes from S to XXL!\n\nYou can check the size guide on the product page. If unsure about your size, contact us."
      } else if (lowercaseInput.includes("إرجاع") || lowercaseInput.includes("return") || lowercaseInput.includes("استبدال") || lowercaseInput.includes("exchange")) {
        response = language === "ar"
          ? "نوفر سياسة إرجاع مرنة:\n\n✓ 14 يوم لإرجاع المنتج\n✓ استرداد كامل المبلغ\n✓ استبدال مجاني\n✓ المنتج بحالته الأصلية\n\nهل تريد معرفة المزيد؟"
          : "Flexible return policy:\n\n✓ 14 days to return\n✓ Full refund\n✓ Free exchange\n✓ Product in original condition\n\nWant to know more?"
      } else if (lowercaseInput.includes("دفع") || lowercaseInput.includes("payment") || lowercaseInput.includes("طريقة")) {
        response = language === "ar"
          ? "💳 طرق الدفع المتاحة:\n\n• الدفع عند الاستلام\n• بطاقات الائتمان\n• المحافظ الإلكترونية\n• ��لتحويل البنكي\n\nجميع المعاملات آمنة ومشفرة 🔒"
          : "💳 Available payment methods:\n\n• Cash on Delivery\n• Credit Cards\n• E-Wallets\n• Bank Transfer\n\nAll transactions are secure 🔒"
      } else if (lowercaseInput.includes("تواصل") || lowercaseInput.includes("contact") || lowercaseInput.includes("رقم") || lowercaseInput.includes("phone") || lowercaseInput.includes("واتس") || lowercaseInput.includes("whatsapp")) {
        response = language === "ar"
          ? "📞 تواصل معنا:\n\n• الهاتف: 015 00550388\n• البريد: seven_blue1978@gmail.com\n• واتساب: +201500550388\n• فيسبوك: Seven Blue Store\n• إنستجرام: @sevenblue_1978\n\nنحن في خدمتك 24/7! 🌟"
          : "📞 Contact Us:\n\n• Phone: 015 00550388\n• Email: seven_blue1978@gmail.com\n• WhatsApp: +201500550388\n• Facebook: Seven Blue Store\n• Instagram: @sevenblue_1978\n\nWe're here 24/7! 🌟"
      } else if (lowercaseInput.includes("عن") || lowercaseInput.includes("about") || lowercaseInput.includes("من نحن") || lowercaseInput.includes("who are")) {
        response = language === "ar"
          ? "🏪 عن Seven Blue:\n\nنحن براند مصري راقي متخصص في الملابس العصرية بجودة عالية.\n\n✨ مميزاتنا:\n• منتجات أصلية 100%\n• تصاميم عصرية وأنيقة\n• أسعار تنافسية\n• شحن مجاني\n• خدمة عملاء ممتازة\n\n📍 نوصل لجميع أنحاء مصر"
          : "🏪 About Seven Blue:\n\nWe're a premium Egyptian brand specializing in modern fashion.\n\n✨ Our Features:\n• 100% Authentic\n• Modern & Elegant\n• Competitive Prices\n• Free Shipping\n• Excellent Service\n\n📍 Delivery across Egypt"
      } else if (lowercaseInput.includes("جودة") || lowercaseInput.includes("quality") || lowercaseInput.includes("ضمان") || lowercaseInput.includes("guarantee")) {
        response = language === "ar"
          ? "⭐ نضمن لك أعلى جودة!\n\n✓ منتجات أصلية 100%\n✓ خامات فاخرة\n✓ ضمان الجودة\n✓ فحص دقيق قبل الشحن\n✓ استبدال مجاني للعيوب\n\nرضاك هو هدفنا الأول! 🎯"
          : "⭐ We guarantee the highest quality!\n\n✓ 100% Authentic\n✓ Premium Materials\n✓ Quality Guarantee\n✓ Inspected Before Shipping\n✓ Free Exchange for Defects\n\nYour satisfaction is our priority! 🎯"
      } else if (lowercaseInput.includes("عرض") || lowercaseInput.includes("offer") || lowercaseInput.includes("خصم") || lowercaseInput.includes("discount") || lowercaseInput.includes("تخفيض") || lowercaseInput.includes("sale")) {
        response = language === "ar"
          ? "🎉 العروض والخصومات:\n\n• عروض يومية على منتجات مختارة\n• خصومات تصل إلى 50%\n• برنامج الولاء والمكافآت\n• عروض موسمية حصرية\n\nتابعنا للحصول على أحدث العروض! 🔥"
          : "🎉 Offers & Discounts:\n\n• Daily deals on selected items\n• Up to 50% off\n• Loyalty rewards program\n• Exclusive seasonal offers\n\nFollow us for latest deals! 🔥"
      } else if (lowercaseInput.includes("حساب") || lowercaseInput.includes("account") || lowercaseInput.includes("تسجيل") || lowercaseInput.includes("register") || lowercaseInput.includes("دخول") || lowercaseInput.includes("login")) {
        response = language === "ar"
          ? "👤 حسابك في Seven Blue:\n\n• سجل حساب جديد مجاناً\n• احفظ عناوينك المفضلة\n• تتبع طلباتك\n• قائمة الأمنيات\n• عروض حصرية للأعضاء\n• برنامج النقاط والمكافآت\n\nانضم لعائلتنا الآن! 🌟"
          : "👤 Your Seven Blue Account:\n\n• Register for free\n• Save favorite addresses\n• Track your orders\n• Wishlist\n• Exclusive member offers\n• Points & rewards program\n\nJoin our family now! 🌟"
      } else {
        response = language === "ar"
          ? "شكراً لسؤالك! 😊\n\nيمكنني مساعدتك في:\n• معلومات المنتجات\n• الأسعار والعروض\n• الشحن والتوصيل\n• المقاسات\n• الدفع والإرجاع\n\nأو يمكنك التواصل مع فريق الدعم:\n📞 015 00550388"
          : "Thanks for asking! 😊\n\nI can help with:\n• Product info\n• Prices & offers\n• Shipping\n• Sizes\n• Payment & returns\n\nOr contact support:\n📞 015 00550388"
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  // Don't render anything if user is authenticated
  if (!shouldShowAI) {
    return null
  }

  return (
    <>
      {/* Floating Button with Hint */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3"
          >
            {/* Hint Text */}
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, x: 20, y: -10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: 20, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl px-4 py-3 shadow-xl border border-blue-200 dark:border-blue-800 max-w-xs"
                >
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {language === "ar" ? "💡 مساعدك الذكي جاهز - تحدث معي!" : "💡 Your AI Assistant Ready - Chat with me!"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Cartoon Button */}
            <Button
              onClick={() => {
                setIsOpen(true)
                setShowHint(false)
              }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
              
              {/* Cartoon AI Face SVG */}
              <svg 
                viewBox="0 0 100 100" 
                className="w-8 h-8 relative z-10 text-white group-hover:scale-110 transition-transform"
                fill="currentColor"
              >
                {/* Face circle */}
                <circle cx="50" cy="50" r="45" fill="white" />
                {/* Left eye */}
                <circle cx="35" cy="40" r="6" fill="#3b82f6" />
                <circle cx="37" cy="38" r="2" fill="white" />
                {/* Right eye */}
                <circle cx="65" cy="40" r="6" fill="#3b82f6" />
                <circle cx="67" cy="38" r="2" fill="white" />
                {/* Happy mouth */}
                <path d="M 35 60 Q 50 70 65 60" stroke="#3b82f6" strokeWidth="3" fill="none" strokeLinecap="round" />
                {/* Sparkle decoration */}
                <circle cx="75" cy="25" r="3" fill="#fbbf24" />
              </svg>
              
              <div className="absolute -top-1 -end-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white animate-pulse" />
              </div>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 end-6 z-50 w-[380px] md:w-[380px] max-w-[calc(100vw-16px)] md:max-w-[calc(100vw-32px)] h-[600px] md:h-auto max-h-[calc(100vh-120px)] md:max-h-none"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 h-full md:h-auto flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm md:text-base">{t("المساعد الذكي", "AI Assistant")}</h3>
                    <p className="text-white/80 text-xs">{t("متصل الآن", "Online now")}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-gradient-to-b from-stone-50 to-white space-y-3 md:space-y-4 md:h-[400px]">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-2",
                      message.sender === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.sender === "ai" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2.5 whitespace-pre-line text-sm",
                        message.sender === "user"
                          ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                          : "bg-white border border-stone-200 text-slate-700"
                      )}
                    >
                      {message.text}
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2 justify-start"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white border border-stone-200 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              {messages.length <= 1 && (
                <div className="px-3 md:px-4 pb-2 md:pb-3 space-y-1.5 md:space-y-2 flex-shrink-0">
                  {quickActions.map((action) => (
                    <Button
                      key={action.action}
                      onClick={() => handleQuickAction(action.action)}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2 text-xs md:text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all py-1.5 md:py-2"
                    >
                      <action.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span className="truncate">{t(action.label, action.labelEn)}</span>
                    </Button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-3 md:p-4 bg-stone-50 border-t border-stone-200 flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={t("اكتب رسالتك...", "Type your message...")}
                    className="flex-1 bg-white border-stone-200 focus:border-blue-400 text-xs md:text-sm py-1.5 md:py-2"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isTyping}
                    size="sm"
                    className="bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 px-3 md:px-4"
                  >
                    {isTyping ? (
                      <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
