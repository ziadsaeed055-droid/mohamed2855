# دليل البدء السريع
# Quick Start Guide

## 🚀 ابدأ هنا | Start Here

### الخطوة 1: الفهم الأساسي
```
النظام الجديد يسمح باختيار ألوان مع درجات محددة
مثل: "أزرق متوسط" بدلاً من "#3b82f6"
```

### الخطوة 2: الملفات المهمة
```
lib/types.ts                      - البيانات والنوع
components/color-search-selector  - المكون الرئيسي
```

### الخطوة 3: الاستخدام السريع
```tsx
import { ColorSearchSelector } from "@/components/color-search-selector"

<ColorSearchSelector
  value={selectedColor}
  onChange={setSelectedColor}
/>
```

---

## 📝 مثال عملي | Practical Example

### اختيار لون واحد

```tsx
'use client'
import { useState } from 'react'
import { ColorSearchSelector } from '@/components/color-search-selector'
import type { ColorSelection } from '@/lib/types'

export default function Example() {
  const [color, setColor] = useState<ColorSelection | null>(null)
  
  return (
    <div className="p-4 space-y-4">
      <ColorSearchSelector
        value={color}
        onChange={setColor}
        showLabel={true}
        label="اختر لوناً"
      />
      
      {color && (
        <div className="p-4 bg-gray-100 rounded">
          <p>اللون المختار: {color.label}</p>
          <p>الدرجة: {color.shadeId}</p>
        </div>
      )}
    </div>
  )
}
```

### اختيار عدة ألوان

```tsx
'use client'
import { useState } from 'react'
import { ColorSearchSelector } from '@/components/color-search-selector'
import type { ColorSelection } from '@/lib/types'

export default function MultiExample() {
  const [colors, setColors] = useState<ColorSelection[]>([])
  
  return (
    <div className="p-4 space-y-4">
      <ColorSearchSelector
        multiSelect={true}
        selectedColors={colors}
        onMultipleChange={setColors}
        showLabel={true}
        label="اختر عدة ألوان"
      />
      
      {colors.length > 0 && (
        <div className="space-y-2">
          {colors.map(color => (
            <div key={color.shadeId} className="p-2 bg-gray-100 rounded">
              {color.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## 🔍 التحقق من التثبيت | Verify Installation

### تحقق من الملفات
```bash
# يجب أن تكون موجودة:
✓ lib/types.ts                 (معدل)
✓ components/color-search-selector.tsx  (جديد)
✓ app/dashboard/add-product/page.tsx   (معدل)
✓ components/product-content.tsx       (معدل)
```

### تشغيل الاختبار
```bash
# اختبر أن الأنواع صحيحة
npx tsc --noEmit

# اختبر أن Build نظيف
npm run build
```

---

## 🎨 الألوان المتاحة | Available Colors

### الألوان الأساسية
```
أسود     (Black)          - 1 درجة
أبيض     (White)          - 1 درجة
كحلي     (Navy)           - 10 درجات
أزرق     (Blue)           - 10 درجات
أزرق سماوي (Sky Blue)     - 10 درجات
أحمر     (Red)            - 10 درجات
أخضر     (Green)          - 10 درجات
أزرق مخضر (Teal)          - 10 درجات
رمادي    (Gray)           - 10 درجات
بني      (Brown)          - 10 درجات
وردي     (Pink)           - 10 درجات
برتقالي  (Orange)         - 10 درجات
```

### البحث عن ألوان
```
اكتب "أزرق" → سيجد كل الألوان الزرقاء
اكتب "متوسط" → سيجد الدرجة المتوسطة
اكتب "فاتح" → سيجد الدرجات الفاتحة
اكتب "blue" → سيجد Blue بالإنجليزية
```

---

## 📊 هيكل البيانات | Data Structure

### ColorSelection
```typescript
{
  colorId: "blue",          // مجموعة اللون
  shadeId: "blue-500",      // الدرجة المحددة
  label: "أزرق متوسط"       // النص المعروض
}
```

### في قاعدة البيانات
```json
{
  "colors": [
    {
      "colorId": "blue",
      "shadeId": "blue-500",
      "label": "أزرق متوسط"
    },
    {
      "colorId": "red",
      "shadeId": "red-600",
      "label": "أحمر غامق قليلاً"
    }
  ]
}
```

---

## ⚙️ الإعدادات | Configuration

### تغيير عدد الألوان
```typescript
// في lib/types.ts
export const COLORS: BaseColor[] = [
  // أضف مجموعات لون جديدة هنا
]
```

### تغيير درجات اللون
```typescript
// في lib/types.ts
export const COLOR_SHADES = {
  50: { ar: "...", en: "..." },
  100: { ar: "...", en: "..." },
  // إضافة درجات جديدة
}
```

---

## 🐛 استكشاف الأخطاء | Troubleshooting

### خطأ: "ColorSelection غير معرّفة"
```
الحل: استيراد من lib/types
import type { ColorSelection } from '@/lib/types'
```

### خطأ: "المكون لا يعمل"
```
الحل: تأكد من استخدام 'use client'
'use client'  // ضروري للمكون
```

### خطأ: "البحث بطيء"
```
الحل: هذا طبيعي - يستخدم debounce بـ 300ms
هذا يحسّن الأداء
```

---

## 📚 الموارد | Resources

### الملفات الأساسية
```
lib/types.ts                      - الأنواع والبيانات
components/color-search-selector  - المكون
COLORS_SYSTEM.md                 - التوثيق الكامل
COLOR_SELECTOR_USAGE.md          - دليل الاستخدام
```

### أمثلة
```
app/dashboard/add-product/page.tsx  - مثال متعدد الاختيار
components/product-content.tsx      - مثال الاختيار المفرد
app/shop/shop-content.tsx           - مثال الفلاتر
```

---

## ✅ قائمة التحقق | Checklist

قبل البدء:
- [ ] قرأت الملف الحالي
- [ ] فهمت الفرق بين النظام القديم والجديد
- [ ] نسخت مثالاً وجربته
- [ ] تحققت من الملفات موجودة

جاهز للإنتاج:
- [ ] الكود يترجم بدون أخطاء
- [ ] Build نجح
- [ ] اختبرت واجهة البحث
- [ ] اختبرت الاختيار والحفظ

---

## 🎯 الخطوات التالية | Next Steps

1. **اقرأ التوثيق الكامل**
   ```
   COLORS_SYSTEM.md - فهم النظام بشكل كامل
   ```

2. **اختبر الأمثلة**
   ```
   انسخ المثال وجرّبه في مشروعك
   ```

3. **ادمج مع مشروعك**
   ```
   ابدأ باستخدام المكون في صفحاتك
   ```

4. **راقب الأداء**
   ```
   تأكد من أن البحث سريع والفلترة تعمل
   ```

---

## 💬 أسئلة شائعة | FAQ

**س: هل البيانات القديمة ستعمل؟**
ج: نعم، النظام يدعم كلا الصيغة

**س: كيف أضيف لوناً جديداً؟**
ج: عدّل COLORS array في lib/types.ts

**س: هل أحتاج إلى database migration؟**
ج: لا، البيانات الجديدة ستعمل تلقائياً

**س: كم درجة متاحة لكل لون؟**
ج: عادة 10 درجات (من 50 إلى 900)

---

## 🎉 مبروك! | Congratulations!

أنت الآن جاهز لاستخدام نظام الألوان الجديد المتقدم!

```
✅ نظام البحث الذكي
✅ اختيار الدرجات
✅ التكامل الكامل
✅ الأداء الممتاز
```

---

**التاريخ:** 24 فبراير 2026
**الحالة:** جاهز للاستخدام
**الدعم:** اطلع على الملفات الأخرى للمزيد من التفاصيل
