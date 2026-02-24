# دليل استخدام ColorSearchSelector
# ColorSearchSelector Component Usage Guide

## 🎯 نظرة سريعة | Quick Overview

مكون `ColorSearchSelector` يوفر واجهة احترافية لاختيار الألوان والدرجات. يدعم الاختيار المفرد والمتعدد مع البحث الذكي.

---

## 📦 الاستيراد | Import

```tsx
import { ColorSearchSelector } from "@/components/color-search-selector"
import type { ColorSelection } from "@/lib/types"
```

---

## 🎨 حالات الاستخدام | Use Cases

### 1️⃣ اختيار لون واحد (صفحة تفاصيل المنتج)

```tsx
import { useState } from "react"
import { ColorSearchSelector } from "@/components/color-search-selector"
import type { ColorSelection } from "@/lib/types"

export function ProductDetails() {
  const [selectedColor, setSelectedColor] = useState<ColorSelection | null>(null)
  
  return (
    <ColorSearchSelector
      value={selectedColor}
      onChange={setSelectedColor}
      showLabel={true}
      label="اختر اللون والدرجة"
      placeholder="ابحث عن لون..."
    />
  )
}
```

**الخصائص:**
- `value`: اللون المختار الحالي
- `onChange`: دالة تُستدعى عند التغيير
- `showLabel`: عرض العنوان (اختياري)
- `label`: نص العنوان
- `placeholder`: نص البحث الافتراضي

---

### 2️⃣ اختيار عدة ألوان (صفحة إضافة المنتج)

```tsx
import { useState } from "react"
import { ColorSearchSelector } from "@/components/color-search-selector"
import type { ColorSelection } from "@/lib/types"

export function AddProduct() {
  const [selectedColors, setSelectedColors] = useState<ColorSelection[]>([])
  
  return (
    <ColorSearchSelector
      multiSelect={true}
      selectedColors={selectedColors}
      onMultipleChange={setSelectedColors}
      showLabel={true}
      label="الألوان المتاحة"
    />
  )
}
```

**الخصائص الإضافية:**
- `multiSelect`: تفعيل الاختيار المتعدد
- `selectedColors`: مصفوفة الألوان المختارة
- `onMultipleChange`: دالة تُستدعى عند التغيير في الاختيار المتعدد

---

### 3️⃣ في نظام الفلاتر

```tsx
import { useState } from "react"
import { ColorSearchSelector } from "@/components/color-search-selector"
import type { ColorSelection } from "@/lib/types"

export function Filters() {
  const [filterColors, setFilterColors] = useState<ColorSelection[]>([])
  
  return (
    <ColorSearchSelector
      multiSelect={true}
      selectedColors={filterColors}
      onMultipleChange={setFilterColors}
      compact={true}  // نمط مدمج للفلاتر
      showLabel={true}
      label="تصفية بالألوان"
    />
  )
}
```

**الخصائص:**
- `compact`: تصميم مدمج للاستخدام في الفلاتر

---

## 🔧 جميع الخصائص | All Props

```tsx
interface ColorSearchSelectorProps {
  // الاختيار المفرد
  value: ColorSelection | null
  onChange: (selection: ColorSelection | null) => void
  
  // الاختيار المتعدد
  multiSelect?: boolean
  selectedColors?: ColorSelection[]
  onMultipleChange?: (selections: ColorSelection[]) => void
  
  // الواجهة
  placeholder?: string
  showLabel?: boolean
  label?: string
  compact?: boolean
}
```

---

## 📊 هيكل ColorSelection | ColorSelection Structure

```tsx
interface ColorSelection {
  colorId: string        // معرف المجموعة الأساسية: "blue"
  shadeId: string       // معرف الدرجة المحددة: "blue-500"
  label: string         // العرض الكامل: "أزرق متوسط"
}
```

**مثال:**
```tsx
const selection: ColorSelection = {
  colorId: "blue",
  shadeId: "blue-500",
  label: "أزرق متوسط"
}
```

---

## 🎯 أمثلة متقدمة | Advanced Examples

### مع معالجة الأخطاء

```tsx
const [color, setColor] = useState<ColorSelection | null>(null)

const handleColorChange = (selection: ColorSelection | null) => {
  if (selection) {
    console.log("اللون المختار:", selection.label)
    console.log("معرف الدرجة:", selection.shadeId)
  }
  setColor(selection)
}

return (
  <ColorSearchSelector
    value={color}
    onChange={handleColorChange}
    showLabel={true}
  />
)
```

### مع إعادة تعيين

```tsx
const [colors, setColors] = useState<ColorSelection[]>([])

const handleReset = () => {
  setColors([])
}

return (
  <>
    <ColorSearchSelector
      multiSelect={true}
      selectedColors={colors}
      onMultipleChange={setColors}
    />
    <button onClick={handleReset}>إعادة تعيين</button>
  </>
)
```

### مع التحقق من الصحة

```tsx
const [colors, setColors] = useState<ColorSelection[]>([])

const handleSubmit = () => {
  if (colors.length === 0) {
    alert("يرجى اختيار لون واحد على الأقل")
    return
  }
  
  console.log("الألوان المختارة:", colors)
  // معالجة الإرسال
}

return (
  <>
    <ColorSearchSelector
      multiSelect={true}
      selectedColors={colors}
      onMultipleChange={setColors}
    />
    <button onClick={handleSubmit}>إرسال</button>
  </>
)
```

---

## 🔍 البحث | Search Features

المكون يدعم:
- ✅ البحث بالعربية
- ✅ البحث بالإنجليزية
- ✅ البحث الفوري
- ✅ اقتراحات ديناميكية
- ✅ debounce (300ms)

**أمثلة البحث:**
```
"أزرق" → نتائج بالعربية
"blue" → نتائج بالإنجليزية
"متوسط" → البحث في درجات الألوان
"medium" → البحث في درجات بالإنجليزية
```

---

## 🎨 الألوان المتاحة | Available Colors

المكون يحتوي على 8 مجموعات ألوان:

| اللون | العربية | الإنجليزية |
|------|---------|-----------|
| أسود | أسود | Black |
| أبيض | أبيض | White |
| كحلي | كحلي | Navy |
| أزرق | أزرق | Blue |
| أزرق سماوي | أزرق سماوي | Sky Blue |
| أحمر | أحمر | Red |
| أخضر | أخضر | Green |
| أزرق مخضر | أزرق مخضر | Teal |
| رمادي | رمادي | Gray |
| بني | بني | Brown |
| وردي | وردي | Pink |
| برتقالي | برتقالي | Orange |

**كل لون يحتوي على 10 درجات:**
```
50 - فاتح جداً جداً (Ultra Light)
100 - فاتح جداً (Very Light)
200 - فاتح (Light)
300 - فاتح نسبياً (Somewhat Light)
400 - فاتح قليلاً (Slightly Light)
500 - متوسط (Medium)
600 - غامق قليلاً (Slightly Dark)
700 - غامق نسبياً (Somewhat Dark)
800 - غامق (Dark)
900 - غامق جداً (Very Dark)
```

---

## 💾 حفظ البيانات | Saving Data

### في Firebase

```tsx
// حفظ لون مفرد
const productData = {
  colors: [selectedColor],  // يُحفظ كـ ColorSelection[]
  // ... باقي البيانات
}

// حفظ عدة ألوان
const productData = {
  colors: selectedColors,  // مصفوفة ColorSelection
  // ... باقي البيانات
}
```

### في السلة

```tsx
// اختيار لون للإضافة في السلة
const cartItem = {
  productId: "...",
  selectedColor: selectedColor,  // ColorSelection
  selectedSize: "...",
  quantity: 1
}
```

---

## 🐛 استكشاف الأخطاء | Troubleshooting

### المشكلة: لا تظهر الدرجات
**الحل:** تأكد من أن `multiSelect` يساوي `false` عند الاختيار المفرد

### المشكلة: البحث بطيء
**الحل:** المكون يستخدم debounce بـ 300ms - هذا عادي

### المشكلة: عدم حفظ البيانات
**الحل:** تأكد من أنك تحفظ `ColorSelection` الكاملة وليس فقط `shadeId`

### المشكلة: خطأ في TypeScript
**الحل:** استيراد `ColorSelection` من `@/lib/types`

---

## 🚀 أفضل الممارسات | Best Practices

✅ **افعل:**
```tsx
// استخدم ColorSelection كاملة
const [color, setColor] = useState<ColorSelection | null>(null)

// استخدم state منفصل للألوان المتعددة
const [colors, setColors] = useState<ColorSelection[]>([])

// تحقق من صحة البيانات قبل الحفظ
if (colors.length === 0) return alert("اختر لون")
```

❌ **لا تفعل:**
```tsx
// لا تستخدم شيء آخر غير ColorSelection
const color = "blue-500"  // ❌ خطأ

// لا تخزن القيم من mutable state
const colors = ["blue-500", "red-600"]  // ❌ قد تتغير

// لا تنسَ التحقق من البيانات
addToCart(selectedColor)  // ❌ قد تكون null
```

---

## 📚 الدوال المساعدة | Helper Functions

```tsx
import { 
  getColorVariants,
  searchColorsByName,
  getColorVariantById,
  getColorLabel
} from "@/lib/types"

// الحصول على جميع درجات لون
const variants = getColorVariants("blue")

// البحث عن الألوان
const results = searchColorsByName("أزرق")

// الحصول على درجة معينة
const variant = getColorVariantById("blue-500")

// الحصول على عرض اللون
const label = getColorLabel("blue", "blue-500", "ar")
// النتيجة: "أزرق متوسط"
```

---

## 🔗 الملفات ذات الصلة | Related Files

- `lib/types.ts` - تعريفات النوع وHelper functions
- `COLORS_SYSTEM.md` - توثيق النظام الكامل
- `IMPLEMENTATION_CHECKLIST.md` - قائمة التحقق

---

## 📞 الدعم | Support

إذا واجهت مشكلة:
1. اطلع على `COLORS_SYSTEM.md`
2. تحقق من الأمثلة في هذا الملف
3. اطلع على الكود في `components/color-search-selector.tsx`

---

**آخر تحديث | Last Updated:** 2026-02-24
**النسخة | Version:** 1.0.0
