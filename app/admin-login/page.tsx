"use client"

import { useEffect } from "react"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Mail, Lock, LogIn, Eye, EyeOff, ArrowRight, Shield, Sparkles } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)

      toast({
        title: "نجح تسجيل الدخول",
        description: "جاري إعادة التوجيه إلى لوحة التحكم...",
      })

      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (error: any) {
      console.error("[v0] Login error:", error.message)

      if (error.code === "auth/user-not-found") {
        setError("البريد الإلكتروني غير موجود")
      } else if (error.code === "auth/wrong-password") {
        setError("كلمة المرور غير صحيحة")
      } else if (error.code === "auth/invalid-email") {
        setError("البريد الإلكتروني غير صالح")
      } else if (error.code === "auth/user-disabled") {
        setError("حسابك معطل")
      } else {
        setError("فشل تسجيل الدخول. تأكد من البيانات")
      }

      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-0 start-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 end-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 start-1/2 w-72 h-72 bg-white/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-center">
          <div className="animate-slide-up">
            {/* Logo */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm mb-6">
                <Shield className="w-10 h-10 text-accent" />
              </div>
            </div>

            {/* Brand */}
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary-foreground mb-4 tracking-tight">
              Seven Blue
            </h1>
            <p className="text-lg text-primary-foreground/70 mb-8 max-w-md">
              لوحة تحكم احترافية لإدارة متجرك الإلكتروني بكل سهولة
            </p>

            {/* Features */}
            <div className="space-y-4 text-start max-w-sm mx-auto">
              {[
                { icon: Sparkles, text: "إدارة المنتجات والمخزون" },
                { icon: Shield, text: "تتبع الطلبات والشحنات" },
                { icon: LogIn, text: "تحليلات وإحصائيات متقدمة" },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm animate-slide-up"
                  style={{ animationDelay: `${(index + 2) * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-primary-foreground/90 font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Decoration */}
          <div className="absolute bottom-8 start-0 end-0 flex justify-center gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i === 1 ? "bg-accent" : "bg-white/30"}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Header */}
        <header className="p-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="font-medium">العودة للمتجر</span>
          </Link>
          <div className="lg:hidden flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-serif font-bold text-lg">Seven Blue</span>
          </div>
        </header>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* Title */}
            <div className="text-center mb-10 animate-slide-up">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 lg:hidden">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-3">مرحباً بعودتك</h2>
              <p className="text-muted-foreground">قم بتسجيل الدخول للوصول إلى لوحة التحكم</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex gap-3 animate-scale-in">
                <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="font-medium text-destructive">خطأ في تسجيل الدخول</p>
                  <p className="text-sm text-destructive/80">{error}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6 animate-slide-up animation-delay-200">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  البريد الإلكتروني
                </Label>
                <div className="relative group">
                  <div className="absolute start-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-muted flex items-center justify-center transition-colors group-focus-within:bg-primary/10">
                    <Mail className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@sevenblue.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="h-14 ps-16 pe-4 bg-secondary/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all text-base"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  كلمة المرور
                </Label>
                <div className="relative group">
                  <div className="absolute start-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-muted flex items-center justify-center transition-colors group-focus-within:bg-primary/10">
                    <Lock className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="h-14 ps-16 pe-14 bg-secondary/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Eye className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full h-14 text-base font-semibold gap-3 btn-luxury"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    تسجيل الدخول
                  </>
                )}
              </Button>
            </form>

            {/* Info Box */}
            <div className="mt-8 p-5 bg-accent/10 border border-accent/20 rounded-xl animate-slide-up animation-delay-300">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-2">بيانات الدخول الافتراضية</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="text-foreground font-medium">البريد:</span> admin@sevenblue.com
                    </p>
                    <p>
                      <span className="text-foreground font-medium">كلمة المرور:</span> Admin@123456
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-muted-foreground mt-8">هذه الصفحة محمية ومخصصة للمسؤولين فقط</p>
          </div>
        </div>
      </div>
    </div>
  )
}
