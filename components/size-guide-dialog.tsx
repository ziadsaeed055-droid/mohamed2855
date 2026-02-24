"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useLanguage } from "@/contexts/language-context"
import { Ruler, User } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SizeGuideDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: string
}

export function SizeGuideDialog({ open, onOpenChange, category }: SizeGuideDialogProps) {
  const { t, language } = useLanguage()

  const clothingSizes = [
    { size: "XS", chest: "86-89", waist: "71-74", hips: "91-94" },
    { size: "S", chest: "91-94", waist: "76-79", hips: "96-99" },
    { size: "M", chest: "96-99", waist: "81-84", hips: "101-104" },
    { size: "L", chest: "101-104", waist: "86-89", hips: "106-109" },
    { size: "XL", chest: "106-112", waist: "91-97", hips: "111-117" },
    { size: "2XL", chest: "114-120", waist: "99-105", hips: "119-125" },
  ]

  const measurementTips = [
    {
      title: { ar: "محيط الصدر", en: "Chest" },
      desc: { ar: "قس حول أعرض جزء من الصدر", en: "Measure around the fullest part of your chest" }
    },
    {
      title: { ar: "محيط الخصر", en: "Waist" },
      desc: { ar: "قس حول أضيق جزء من الخصر", en: "Measure around the narrowest part of your waist" }
    },
    {
      title: { ar: "محيط الوركين", en: "Hips" },
      desc: { ar: "قس حول أعرض جزء من الوركين", en: "Measure around the fullest part of your hips" }
    }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="w-5 h-5" />
            {t("دليل المقاسات", "Size Guide")}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="table" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="table">
              {t("جدول المقاسات", "Size Chart")}
            </TabsTrigger>
            <TabsTrigger value="measure">
              {t("كيفية القياس", "How to Measure")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-3 text-left border">{t("المقاس", "Size")}</th>
                    <th className="p-3 text-center border">{t("الصدر (سم)", "Chest (cm)")}</th>
                    <th className="p-3 text-center border">{t("الخصر (سم)", "Waist (cm)")}</th>
                    <th className="p-3 text-center border">{t("الوركين (سم)", "Hips (cm)")}</th>
                  </tr>
                </thead>
                <tbody>
                  {clothingSizes.map((size, idx) => (
                    <tr key={size.size} className={idx % 2 === 0 ? "bg-muted/30" : ""}>
                      <td className="p-3 font-bold border">{size.size}</td>
                      <td className="p-3 text-center border">{size.chest}</td>
                      <td className="p-3 text-center border">{size.waist}</td>
                      <td className="p-3 text-center border">{size.hips}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                {t(
                  "💡 نصيحة: إذا كانت قياساتك بين مقاسين، اختر المقاس الأكبر للراحة.",
                  "💡 Tip: If your measurements fall between two sizes, choose the larger size for comfort."
                )}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="measure" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Illustration */}
              <div className="bg-muted rounded-lg p-8 flex items-center justify-center">
                <div className="relative w-48 h-64 bg-gradient-to-b from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                  <User className="w-24 h-24 text-primary/40" />
                  <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-primary" />
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary" />
                  <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-primary" />
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                {measurementTips.map((tip, idx) => (
                  <div key={idx} className="space-y-2 p-4 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <h4 className="font-semibold">
                        {language === "ar" ? tip.title.ar : tip.title.en}
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground ps-10">
                      {language === "ar" ? tip.desc.ar : tip.desc.en}
                    </p>
                  </div>
                ))}

                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
                  <h5 className="font-semibold mb-2 text-amber-900 dark:text-amber-100">
                    {t("نصائح مهمة:", "Important Tips:")}
                  </h5>
                  <ul className="text-sm space-y-1 text-amber-800 dark:text-amber-200">
                    <li>• {t("استخدم شريط قياس مرن", "Use a flexible measuring tape")}</li>
                    <li>• {t("قس على ملابس داخلية خفيفة", "Measure over light clothing")}</li>
                    <li>• {t("لا تشد الشريط بقوة", "Don't pull the tape too tight")}</li>
                    <li>• {t("قس مرتين للتأكد", "Measure twice to be sure")}</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
