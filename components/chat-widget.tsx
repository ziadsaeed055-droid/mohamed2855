"use client"

import { useState, useRef, useEffect } from "react"
import { MessageSquare, X, Send, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useChat } from "@/contexts/chat-context"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const {
    currentConversation,
    messages,
    sendMessage,
    createConversation,
    setCurrentConversation,
    indexError,
    fetchMessages,
    conversations,
  } = useChat()
  const { user, firebaseUser, loading: authLoading } = useAuth()
  const { t, language } = useLanguage()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && firebaseUser && !currentConversation) {
      // البحث عن محادثة المستخدم الحالي
      const userConversation = conversations.find((conv) => conv.userId === firebaseUser.uid)
      if (userConversation) {
        console.log("[v0] Found existing conversation, loading messages")
        setCurrentConversation(userConversation)
      }
    }
  }, [isOpen, firebaseUser, conversations, currentConversation, setCurrentConversation])

  if (!isMounted || authLoading) {
    return null
  }

  if (!firebaseUser) {
    return null
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDateTime = (date: Date | any) => {
    const dateObj = date instanceof Date ? date : new Date(date)
    return dateObj.toLocaleString(language === "ar" ? "ar-SA" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return

    if (!firebaseUser) {
      setError(t("يجب أن تكون مسجل دخول لإرسال رسالة", "You must be logged in to send a message"))
      return
    }

    if (!currentConversation) {
      try {
        setIsSending(true)
        setError(null)
        const newConversation = await createConversation(
          user?.displayName || t("زائر", "Guest"),
          user?.email || "guest@example.com",
          t("استفسار عام", "General Inquiry"),
        )
        setCurrentConversation(newConversation)
        console.log("[v0] New conversation created:", newConversation.id)

        await sendMessage(newConversation.id, message, "user")
        console.log("[v0] Message sent successfully to new conversation")

        setMessage("")
      } catch (error) {
        console.error("[v0] Error:", error)
        const errorMsg = error instanceof Error ? error.message : t("حدث خطأ في إرسال الرسالة", "Error sending message")
        setError(errorMsg)
        alert(errorMsg)
      } finally {
        setIsSending(false)
      }
    } else {
      try {
        setIsSending(true)
        setError(null)
        console.log("[v0] Sending message to existing conversation:", currentConversation.id)

        await sendMessage(currentConversation.id, message, "user")
        console.log("[v0] Message sent to existing conversation")

        setMessage("")
      } catch (error) {
        console.error("[v0] Error sending message:", error)
        const errorMsg = error instanceof Error ? error.message : t("حدث خطأ في إرسال الرسالة", "Error sending message")
        setError(errorMsg)
        alert(errorMsg)
      } finally {
        setIsSending(false)
      }
    }
  }

  return (
    <>
      {/* Chat Widget Button - Enhanced Design */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-40 animate-bounce hover:from-primary/90 hover:to-primary"
          aria-label={t("فتح الدردشة", "Open chat")}
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat Dialog - Enhanced Styling */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh] z-50 animate-scale-in backdrop-blur-sm">
          {/* Header - Enhanced */}
          <div className="bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-primary-foreground p-4 flex items-center justify-between shadow-md">
            <div>
              <h3 className="font-bold text-lg">{t("دعم العملاء", "Customer Support")}</h3>
              <p className="text-xs opacity-90">{t("نحن هنا للمساعدة", "We're here to help")}</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-primary-foreground/20 rounded-lg transition-colors duration-200"
              aria-label={t("إغلاق", "Close")}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages - Enhanced Styling */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50 scrollbar-thin">
            {indexError && (
              <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded-lg flex gap-3 items-start shadow-sm">
                <div className="flex-shrink-0">
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="text-sm flex-1">
                  <p className="font-medium">{t("جاري تفعيل نظام الفهرسة", "Firestore Index is being activated")}</p>
                  <p className="text-xs mt-1 opacity-85">
                    {t(
                      "تم إرسال رسالتك بنجاح. يجري تفعيل الفهرس الآن (عادة 2-5 دقائق)",
                      "Your message was sent successfully. The index is being activated (usually 2-5 minutes)",
                    )}
                  </p>
                </div>
              </div>
            )}

            {error && !indexError && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg flex gap-2 items-start">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {messages.length === 0 && !indexError && currentConversation && (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">{t("لا توجد رسائل بعد", "No messages yet")}</p>
                <p className="text-xs text-muted-foreground/70 mt-2">
                  {t("ابدأ محادثتك معنا الآن", "Start a conversation with us now")}
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3 animate-fade-in",
                  msg.senderRole === "admin" ? "justify-start" : "justify-end",
                )}
              >
                {msg.senderRole === "admin" && (
                  <Avatar className="w-9 h-9 flex-shrink-0 shadow-sm">
                    <AvatarImage src="/images/seven-blue-logo.png" alt="Admin" />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">SB</AvatarFallback>
                  </Avatar>
                )}
                <div className="max-w-xs">
                  <div
                    className={cn(
                      "px-4 py-3 rounded-2xl text-sm break-words shadow-sm transition-all duration-200 hover:shadow-md",
                      msg.senderRole === "admin"
                        ? "bg-primary text-primary-foreground rounded-bl-none"
                        : "bg-secondary text-secondary-foreground rounded-br-none",
                    )}
                  >
                    <p className="text-xs font-semibold opacity-80 mb-1">{msg.senderName}</p>
                    <p className="leading-relaxed">{msg.content}</p>
                    <p className="text-xs opacity-60 mt-2 font-medium">{formatDateTime(msg.createdAt)}</p>
                  </div>
                </div>
                {msg.senderRole === "user" && (
                  <Avatar className="w-9 h-9 flex-shrink-0 shadow-sm">
                    <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "User"} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground font-bold">
                      {getInitials(user?.displayName || "U")}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input - Enhanced */}
          <div className="border-t bg-card p-4 shadow-md">
            <div className="flex gap-2">
              <Input
                placeholder={t("اكتب رسالتك...", "Type your message...")}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                disabled={isSending}
                className="bg-background/50 focus-visible:ring-2"
              />
              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={!message.trim() || isSending}
                className="gap-2 shadow-md hover:shadow-lg transition-all"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
