"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Loader2, HelpCircle, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  text: string
  sender: "user" | "support"
  timestamp: Date
}

export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { t, language } = useLanguage()
  const { user } = useAuth()

  // Only show Support Chat if user is authenticated
  const shouldShowSupport = !!user

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: language === "ar"
          ? "مرحباً بك في خدمة العملاء Seven Blue! 👋\n\nكيف يمكننا مساعدتك؟"
          : "Welcome to Seven Blue Customer Support! 👋\n\nHow can we help?",
        sender: "support",
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, messages.length, language])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
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

    // Auto response from support
    setTimeout(() => {
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: language === "ar"
          ? "شكراً لك! سيتواصل معك فريق الدعم قريباً. في الوقت الحالي يمكنك:\n\n📞 الاتصال: 015 00550388\n📧 البريد: seven_blue1978@gmail.com\n💬 واتساب: +201500550388"
          : "Thank you! Our support team will reach out soon. In the meantime:\n\n📞 Call: 015 00550388\n📧 Email: seven_blue1978@gmail.com\n💬 WhatsApp: +201500550388",
        sender: "support",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, supportMessage])
      setIsTyping(false)
    }, 1500)
  }

  if (!shouldShowSupport) {
    return null
  }

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 end-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
              <HelpCircle className="w-7 h-7 text-white group-hover:scale-110 transition-transform relative z-10" />
              <div className="absolute -top-1 -end-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
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
            className="fixed bottom-6 end-6 z-50 w-[380px] max-w-[calc(100vw-16px)] h-[600px] max-h-[calc(100vh-120px)]"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 h-full flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{t("خدمة العملاء", "Support")}</h3>
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
              <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-stone-50 to-white space-y-4 h-[400px]">
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
                    {message.sender === "support" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                        <HelpCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2.5 whitespace-pre-line text-sm",
                        message.sender === "user"
                          ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
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
                    className="flex gap-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    </div>
                    <div className="bg-white border border-stone-200 rounded-2xl px-4 py-2.5">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-stone-200 p-4 bg-white flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    placeholder={t("اكتب رسالتك...", "Type your message...")}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="rounded-full border-stone-300"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim()}
                    className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white w-10 h-10 p-0"
                  >
                    <Send className="w-4 h-4" />
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
