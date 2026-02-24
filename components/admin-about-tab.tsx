"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save } from "lucide-react"
import { Card } from "@/components/ui/card"

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
    descriptionAr: "منذ انطلاقتنا، كان هدفنا واحداً: تقديم أزياء راقية تعكس شخصيتك",
    descriptionEn: "Since our launch, our goal has been one: to provide elegant fashion",
    backgroundImage: "/images/605811209-122158818428830285-7412234705201285219-n.jpg",
  },
  story: {
    titleAr: "قصتنا",
    titleEn: "Our Story",
    contentAr: "بدأت Seven Blue من حلم بسيط: جعل الموضة الراقية في متناول الجميع.",
    contentEn: "Seven Blue started from a simple dream: making high fashion accessible to everyone.",
    image: "/images/605811209-122158818428830285-7412234705201285219-n.jpg",
  },
  timeline: [],
  values: [],
  stats: { products: 500, experience: 4, customers: 10000, branches: 3 },
  whyUs: [],
  testimonials: [],
}

export function AdminAboutTab() {
  const [data, setData] = useState<AboutData>(defaultData)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const docRef = doc(db, "settings", "aboutPage")
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setData({ ...defaultData, ...docSnap.data() } as AboutData)
      }
    } catch (error) {
      console.error("Error fetching about data:", error)
      toast({ title: "خطأ", description: "فشل تحميل البيانات", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, "settings", "aboutPage"), data)
      toast({ title: "تم الحفظ", description: "تم حفظ التغييرات بنجاح" })
    } catch (error) {
      console.error("Error saving about data:", error)
      toast({ title: "خطأ", description: "فشل حفظ البيانات", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#0d3b66]" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">إدارة صفحة "من نحن"</h2>
        <Button onClick={handleSave} disabled={saving} className="bg-[#0d3b66]">
          {saving ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : <Save className="w-4 h-4 me-2" />}
          حفظ التغييرات
        </Button>
      </div>

      {/* Hero Section */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">قسم البطل (Hero)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>العنوان (عربي)</Label>
            <Input
              value={data.hero.titleAr}
              onChange={(e) => setData({ ...data, hero: { ...data.hero, titleAr: e.target.value } })}
            />
          </div>
          <div>
            <Label>العنوان (English)</Label>
            <Input
              value={data.hero.titleEn}
              onChange={(e) => setData({ ...data, hero: { ...data.hero, titleEn: e.target.value } })}
            />
          </div>
          <div className="col-span-2">
            <Label>رابط الصورة الخلفية</Label>
            <Input
              value={data.hero.backgroundImage}
              onChange={(e) => setData({ ...data, hero: { ...data.hero, backgroundImage: e.target.value } })}
            />
          </div>
        </div>
      </Card>

      {/* Stats Section */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">الأرقام والإحصائيات</h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label>عدد المنتجات</Label>
            <Input
              type="number"
              value={data.stats.products}
              onChange={(e) => setData({ ...data, stats: { ...data.stats, products: Number(e.target.value) } })}
            />
          </div>
          <div>
            <Label>سنوات الخبرة</Label>
            <Input
              type="number"
              value={data.stats.experience}
              onChange={(e) => setData({ ...data, stats: { ...data.stats, experience: Number(e.target.value) } })}
            />
          </div>
          <div>
            <Label>عدد العملاء</Label>
            <Input
              type="number"
              value={data.stats.customers}
              onChange={(e) => setData({ ...data, stats: { ...data.stats, customers: Number(e.target.value) } })}
            />
          </div>
          <div>
            <Label>عدد الفروع</Label>
            <Input
              type="number"
              value={data.stats.branches}
              onChange={(e) => setData({ ...data, stats: { ...data.stats, branches: Number(e.target.value) } })}
            />
          </div>
        </div>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full bg-[#0d3b66]" size="lg">
        {saving ? <Loader2 className="w-5 h-5 animate-spin me-2" /> : <Save className="w-5 h-5 me-2" />}
        حفظ جميع التغييرات
      </Button>
    </div>
  )
}
