"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import {
  Loader2,
  Mail,
  User,
  CheckCircle,
  Lock,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Gift,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getUserByReferralCode } from "@/lib/loyalty-service"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

type AuthTab = "signin" | "signup"

function AuthContent() {
  const router = useRouter()
  const { signInWithGoogle, signInWithEmail, firebaseUser } = useAuth()
  const { t, language } = useLanguage()
  const { toast } = useToast()

  const [tab, setTab] = useState<AuthTab>("signin")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [hasReferral, setHasReferral] = useState(false)
  const [referrerName, setReferrerName] = useState("")
  const [referralCode, setReferralCode] = useState("")

  useEffect(() => {
    window.scrollTo(0, 0)
    
    // Extract referralCode from URL on client-side
    const params = new URLSearchParams(window.location.search)
    const ref = params.get("ref") || ""
    
    console.log("[v0] ==================== AUTH PAGE LOADED ====================")
    console.log("[v0] 📍 Current URL:", window.location.href)
    console.log("[v0] 🔗 Referral Code from URL:", ref || "NONE")
    console.log("[v0] ===========================================================")
    
    if (ref) {
      setReferralCode(ref)
      setHasReferral(true)
      setTab("signup")
      console.log("[v0] ✅ Referral code detected, switching to signup tab")
      
      // Lookup referrer
      ;(async () => {
        try {
          console.log("[v0] 🔍 Step 1: Looking up referral code:", ref)
          const referrerId = await getUserByReferralCode(ref)
          console.log("[v0] 📝 Step 1 Result - Referrer ID:", referrerId || "NOT FOUND")
          
          if (referrerId) {
            console.log("[v0] 🔍 Step 2: Fetching referrer user data...")
            const referrerDoc = await getDoc(doc(db, "users", referrerId))
            console.log("[v0] 📝 Step 2 Result - Document exists:", referrerDoc.exists())
            
            if (referrerDoc.exists()) {
              const referrerData = referrerDoc.data()
              const displayName = referrerData.displayName || "صديقك"
              setReferrerName(displayName)
              console.log("[v0] ✅✅✅ SUCCESS: Referrer name set to:", displayName)
            } else {
              console.error("[v0] ❌ Referrer document doesn't exist for ID:", referrerId)
            }
          } else {
            console.error("[v0] ❌ getUserByReferralCode returned null for code:", ref)
          }
        } catch (error: any) {
          console.error("[v0] ❌ Exception in referrer lookup:", error)
          console.error("[v0] Error details:", {
            message: error?.message,
            code: error?.code,
            stack: error?.stack
          })
        }
      })()
    } else {
      console.log("[v0] ⚠️ No referral code in URL")
    }
  }, [])

  const [showGoogleVerification, setShowGoogleVerification] = useState(false)
  const [googleUserData, setGoogleUserData] = useState<{
    displayName: string
    email: string
    photoURL: string
  } | null>(null)

  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  })

  const [signUpData, setSignUpData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    city: "",
  })

  const handleGoogleSignIn = async () => {
    setError("")
    setLoading(true)
    try {
      console.log("[v0] Google sign-in with referral code:", referralCode || "none")
      const isNewUser = await signInWithGoogle(referralCode || undefined)

      if (firebaseUser) {
        setGoogleUserData({
          displayName: firebaseUser.displayName || "",
          email: firebaseUser.email || "",
          photoURL: firebaseUser.photoURL || "",
        })
        setShowGoogleVerification(true)

        if (isNewUser && referralCode) {
          toast({
            title: t("مكافأة الإحالة!", "Referral Bonus!"),
            description: t("تم إضافة نقاط الإحالة لحسابك", "Referral points added to your account"),
          })
        }
      }

      toast({
        title: t("مرحباً بك!", "Welcome!"),
        description: t("تم تسجيل الدخول بنجاح", "Signed in successfully"),
      })

      setTimeout(() => {
        router.push("/")
      }, 1500)
    } catch (error: any) {
      const errorMessage = error.message || t("فشل تسجيل الدخول", "Sign in failed")
      setError(errorMessage)
      toast({
        title: t("خطأ", "Error"),
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!signInData.email || !signInData.password) {
      setError(t("يرجى ملء جميع الحقول", "Please fill all fields"))
      setLoading(false)
      return
    }

    try {
      await signInWithEmail(signInData.email, signInData.password)
      toast({
        title: t("مرحباً بعودتك!", "Welcome back!"),
        description: t("تم تسجيل الدخول بنجاح", "Signed in successfully"),
      })
      router.push("/")
    } catch (error: any) {
      let errorMessage = t("فشل تسجيل الدخول", "Sign in failed")

      if (error.code === "auth/user-not-found") {
        errorMessage = t("البريد الإلكتروني غير موجود", "Email not found")
      } else if (error.code === "auth/wrong-password") {
        errorMessage = t("كلمة المرور غير صحيحة", "Wrong password")
      } else if (error.code === "auth/invalid-email") {
        errorMessage = t("البريد الإلكتروني غير صالح", "Invalid email")
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = t("بيانات الدخول غير صحيحة", "Invalid credentials")
      }

      setError(errorMessage)
      toast({
        title: t("خطأ", "Error"),
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!signUpData.email || !signUpData.password || !signUpData.displayName) {
      setError(t("يرجى ملء جميع الحقول المطلوبة", "Please fill all required fields"))
      return
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      setError(t("كلمة المرور غير متطابقة", "Passwords don't match"))
      return
    }

    if (signUpData.password.length < 6) {
      setError(t("كلمة المرور يجب أن تكون 6 أحرف على الأقل", "Password must be at least 6 characters"))
      return
    }

    setLoading(true)

    try {
      console.log("[v0] Email sign-up with referral code:", referralCode || "none")
      console.log("[v0] Sign-up data:", {
        displayName: signUpData.displayName,
        email: signUpData.email,
        referralCode: referralCode || undefined,
      })

      await signInWithEmail(signUpData.email, signUpData.password, {
        displayName: signUpData.displayName,
        phone: signUpData.phone,
        city: signUpData.city,
        referralCode: referralCode,
      })

      if (referralCode) {
        toast({
          title: t("مكافأة الإحالة!", "Referral Bonus!"),
          description: t("تم إضافة 3 نقاط إضافية لحسابك!", "3 bonus points added to your account!"),
        })
      }

      toast({
        title: t("تم إنشاء الحساب", "Account created"),
        description: t("مرحباً بك في متجرنا!", "Welcome to our store!"),
      })
      router.push("/")
    } catch (error: any) {
      let errorMessage = t("فشل إنشاء الحساب", "Account creation failed")

      if (error.code === "auth/email-already-in-use") {
        errorMessage = t("البريد الإلكتروني مستخدم بالفعل", "Email already in use")
      } else if (error.code === "auth/weak-password") {
        errorMessage = t("كلمة المرور ضعيفة جداً", "Password is too weak")
      }

      setError(errorMessage)
      toast({
        title: t("خطأ", "Error"),
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header - Only visible on mobile, hidden on desktop */}
      <div className="lg:hidden">
        <Header />
      </div>

      <main className="min-h-screen flex items-center justify-center py-8 md:py-12 px-4">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-0 lg:gap-8 items-stretch lg:items-center">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex flex-col items-center justify-center p-12 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0d3b66] to-[#1a5490] rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-10 left-10 w-32 h-32 border border-white/20 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-20 right-10 w-48 h-48 border border-white/20 rounded-full animate-pulse delay-300"></div>
                  <div className="absolute top-1/2 left-1/4 w-24 h-24 border border-white/20 rounded-full animate-pulse delay-700"></div>
                </div>
              </div>

              <div className="relative z-10 text-center text-white space-y-8 p-8">
                <div className="w-40 h-40 mx-auto relative">
                  <Image
                    src="/images/image.png"
                    alt="Seven Blue Logo"
                    fill
                    className="object-contain drop-shadow-2xl"
                  />
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-bold">{t("مرحباً بك في سيفن بلو", "Welcome to Seven Blue")}</h2>
                  <p className="text-white/80 text-lg max-w-sm mx-auto">
                    {t("اكتشف أفضل الملابس العصرية بأسعار مميزة", "Discover the best modern fashion at great prices")}
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{t("تشكيلة متنوعة وحصرية", "Diverse & Exclusive Collection")}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{t("ضمان الجودة والأصالة", "Quality & Authenticity Guarantee")}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Gift className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{t("نظام نقاط ومكافآت", "Points & Rewards System")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="w-full max-w-md mx-auto lg:mx-0">
              <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-8 border border-slate-100">
                <div className="lg:hidden flex justify-center mb-6">
                  <div className="w-20 h-20 relative">
                    <Image src="/images/image.png" alt="Seven Blue Logo" fill className="object-contain" />
                  </div>
                </div>

                {hasReferral && (
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-emerald-800">
                          {referrerName
                            ? t(`دعوة من ${referrerName}`, `Invited by ${referrerName}`)
                            : t("تم دعوتك!", "You've been invited!")}
                        </p>
                        <p className="text-sm text-emerald-600">
                          {t("سجل الآن واحصل على 3 نقاط مكافأة", "Sign up now and get 3 bonus points")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-1 mb-8 bg-slate-100 p-1.5 rounded-2xl">
                  <button
                    onClick={() => setTab("signin")}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300",
                      tab === "signin" ? "bg-[#0d3b66] text-white shadow-lg" : "text-slate-500 hover:text-slate-700",
                    )}
                  >
                    {t("تسجيل الدخول", "Sign In")}
                  </button>
                  <button
                    onClick={() => setTab("signup")}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300",
                      tab === "signup" ? "bg-[#0d3b66] text-white shadow-lg" : "text-slate-500 hover:text-slate-700",
                    )}
                  >
                    {t("حساب جديد", "Sign Up")}
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-600 text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    {error}
                  </div>
                )}

                {tab === "signin" && (
                  <form onSubmit={handleEmailSignIn} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-slate-700 font-medium">
                        {t("البريد الإلكتروني", "Email")}
                      </Label>
                      <div className="relative">
                        <Mail className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder={t("example@email.com", "example@email.com")}
                          value={signInData.email}
                          onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                          className="ps-12 h-12 rounded-xl border-slate-200 focus:border-[#0d3b66] focus:ring-[#0d3b66]/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-slate-700 font-medium">
                        {t("كلمة المرور", "Password")}
                      </Label>
                      <div className="relative">
                        <Lock className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={signInData.password}
                          onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                          className="ps-12 pe-12 h-12 rounded-xl border-slate-200 focus:border-[#0d3b66] focus:ring-[#0d3b66]/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-[#0d3b66] hover:bg-[#0d3b66]/90 rounded-xl text-base font-semibold shadow-lg shadow-[#0d3b66]/25"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          {t("تسجيل الدخول", "Sign In")}
                          <ArrowRight className={cn("w-5 h-5", language === "ar" ? "rotate-180 me-2" : "ms-2")} />
                        </>
                      )}
                    </Button>
                  </form>
                )}

                {tab === "signup" && (
                  <form onSubmit={handleEmailSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-slate-700 font-medium">
                        {t("الاسم الكامل", "Full Name")} *
                      </Label>
                      <div className="relative">
                        <User className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          id="signup-name"
                          placeholder={t("محمد أحمد", "John Doe")}
                          value={signUpData.displayName}
                          onChange={(e) => setSignUpData({ ...signUpData, displayName: e.target.value })}
                          className="ps-12 h-12 rounded-xl border-slate-200 focus:border-[#0d3b66]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-slate-700 font-medium">
                        {t("البريد الإلكتروني", "Email")} *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="example@email.com"
                          value={signUpData.email}
                          onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                          className="ps-12 h-12 rounded-xl border-slate-200 focus:border-[#0d3b66]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-phone" className="text-slate-700 font-medium">
                          {t("الهاتف", "Phone")}
                        </Label>
                        <div className="relative">
                          <Phone className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <Input
                            id="signup-phone"
                            placeholder="01xxxxxxxxx"
                            value={signUpData.phone}
                            onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                            className="ps-12 h-12 rounded-xl border-slate-200 focus:border-[#0d3b66]"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-city" className="text-slate-700 font-medium">
                          {t("المدينة", "City")}
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <Input
                            id="signup-city"
                            placeholder={t("القاهرة", "Cairo")}
                            value={signUpData.city}
                            onChange={(e) => setSignUpData({ ...signUpData, city: e.target.value })}
                            className="ps-12 h-12 rounded-xl border-slate-200 focus:border-[#0d3b66]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-slate-700 font-medium">
                        {t("كلمة المرور", "Password")} *
                      </Label>
                      <div className="relative">
                        <Lock className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={signUpData.password}
                          onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                          className="ps-12 pe-12 h-12 rounded-xl border-slate-200 focus:border-[#0d3b66]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password" className="text-slate-700 font-medium">
                        {t("تأكيد كلمة المرور", "Confirm Password")} *
                      </Label>
                      <div className="relative">
                        <Lock className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          id="signup-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={signUpData.confirmPassword}
                          onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                          className="ps-12 pe-12 h-12 rounded-xl border-slate-200 focus:border-[#0d3b66]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {hasReferral && (
                      <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl">
                        <Gift className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm text-emerald-700">
                          {t("ستحصل على 3 نقاط مكافأة عند التسجيل!", "You'll get 3 bonus points when you sign up!")}
                        </span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-[#0d3b66] hover:bg-[#0d3b66]/90 rounded-xl text-base font-semibold shadow-lg shadow-[#0d3b66]/25"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          {t("إنشاء حساب", "Create Account")}
                          <ArrowRight className={cn("w-5 h-5", language === "ar" ? "rotate-180 me-2" : "ms-2")} />
                        </>
                      )}
                    </Button>
                  </form>
                )}

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-slate-500">{t("أو", "or")}</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full h-12 rounded-xl border-slate-200 hover:bg-slate-50 gap-3 bg-transparent"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  {t("الدخول بحساب Google", "Continue with Google")}
                </Button>

                <p className="text-center text-xs text-slate-500 mt-6">
                  {t(
                    "بالتسجيل، أنت توافق على شروط الاستخدام وسياسة الخصوصية",
                    "By signing up, you agree to our Terms of Service and Privacy Policy",
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <Dialog open={showGoogleVerification} onOpenChange={setShowGoogleVerification}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              {t("تم تسجيل الدخول بنجاح", "Successfully signed in")}
            </DialogTitle>
            <DialogDescription>{t("مرحباً بك في سيفن بلو", "Welcome to Seven Blue")}</DialogDescription>
          </DialogHeader>
          {googleUserData && (
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              {googleUserData.photoURL ? (
                <Image
                  src={googleUserData.photoURL || "/placeholder.svg"}
                  alt={googleUserData.displayName}
                  width={60}
                  height={60}
                  className="rounded-full"
                />
              ) : (
                <div className="w-[60px] h-[60px] rounded-full bg-[#0d3b66] flex items-center justify-center">
                  <User className="w-7 h-7 text-white" />
                </div>
              )}
              <div>
                <p className="font-semibold text-slate-900">{googleUserData.displayName}</p>
                <p className="text-sm text-slate-500">{googleUserData.email}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0d3b66]" />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  )
}
