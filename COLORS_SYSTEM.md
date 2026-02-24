# نظام الألوان والدرجات الجديد
# New Color & Shades System

## 📋 نظرة عامة | Overview

تم تطوير نظام متقدم لاختيار الألوان والدرجات يجمع بين البحث الذكي والاختيار المرئي. النظام يوفر تجربة مستخدم فريدة وسهلة الاستخدام عبر جميع صفحات التطبيق.

An advanced color and shade selection system has been developed that combines smart search with visual selection. The system provides a unique and user-friendly experience across all application pages.

## 🎯 المميزات الرئيسية | Key Features

### 1. البحث الذكي | Smart Search
- البحث بالاسم (عربي/إنجليزي)
- اقتراحات ديناميكية
- debounce لتحسين الأداء

### 2. اختيار الدرجات | Shade Selection
- عرض درجات متعددة لكل لون
- مرئية بصرية للدرجات (فاتح جداً إلى غامق جداً)
- تصنيف ذكي حسب الشدة

### 3. التكامل الكامل | Full Integration
- صفحة إضافة المنتج
- صفحة تفاصيل المنتج
- نظام الفلترة المتقدم
- صفحة تعديل المنتج

## 📊 هيكل البيانات | Data Structure

### ColorVariant
```typescript
interface ColorVariant {
  id: string                    // "blue-500"
  nameAr: string               // "أزرق متوسط"
  nameEn: string               // "Blue Medium"
  hex: string                  // "#3b82f6"
  shade: number                // 500 (50, 100, 200, ... 900)
  parentColorId: string        // "blue"
  shadeNameAr: string          // "متوسط"
  shadeNameEn: string          // "Medium"
}
```

### BaseColor
```typescript
interface BaseColor {
  id: string                   // "blue"
  nameAr: string
  nameEn: string
  variants: ColorVariant[]
  displayColor?: string
}
```

### ColorSelection
```typescript
interface ColorSelection {
  colorId: string              // "blue"
  shadeId: string             // "blue-500"
  label: string               // "أزرق متوسط"
}
```

## 🔧 الاستخدام | Usage

### صفحة إضافة المنتج | Add Product Page

```tsx
import { ColorSearchSelector } from "@/components/color-search-selector"

// في حالة الاختيار المتعدد
<ColorSearchSelector
  multiSelect={true}
  selectedColors={selectedColors}
  onMultipleChange={setSelectedColors}
/>
```

### صفحة تفاصيل المنتج | Product Details Page

```tsx
<ColorSearchSelector
  value={selectedColor}
  onChange={setSelectedColor}
  compact={false}
/>
```

### نظام الفلترة | Filtering System

```tsx
<ColorSearchSelector
  multiSelect={true}
  selectedColors={filteredColors}
  onMultipleChange={handleColorFilter}
  compact={true}  // للاستخدام في الفلترة
/>
```

## 🎨 الدوال المساعدة | Helper Functions

### getColorVariants()
```typescript
// الحصول على جميع درجات لون معين
const variants = getColorVariants("blue")
```

### searchColorsByName()
```typescript
// البحث عن ألوان بالاسم
const results = searchColorsByName("أزرق")
```

### getColorVariantById()
```typescript
// الحصول على درجة معينة
const variant = getColorVariantById("blue-500")
```

### getColorLabel()
```typescript
// الحصول على عرض اللون (نص كامل)
const label = getColorLabel("blue", "blue-500", "ar")
// النتيجة: "أزرق متوسط"
```

## 📁 الملفات المعدلة | Modified Files

### lib/types.ts
- إضافة `ColorVariant` interface
- إضافة `BaseColor` interface
- إضافة `ColorSelection` interface
- تحديث `Product` interface لاستخدام `ColorSelection[]`
- تحديث `CartItem` interface
- إضافة دوال مساعدة

### components/color-search-selector.tsx
- مكون جديد تماماً
- دعم البحث الذكي
- عرض ديناميكي للدرجات
- وضع الاختيار المفرد والمتعدد

### app/dashboard/add-product/page.tsx
- استبدال checkbox colors بـ ColorSearchSelector
- تحديث state للألوان
- تحديث التحقق من الصحة

### components/product-content.tsx
- استبدال عرض الألوان بـ ColorSearchSelector
- تحديث دوال getColorDisplayName و getImageForColor
- تحديث handleAddToCart
- تحديث getColorFilterStyle

## ⚙️ التكامل مع قاعدة البيانات | Database Integration

### تخزين البيانات | Data Storage

**السابق (Legacy):**
```json
{
  "colors": ["#3b82f6", "#ef4444"]
}
```

**الجديد (New):**
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

### صور المنتج | Product Images

**السابق (Legacy):**
```json
{
  "colorImages": {
    "#3b82f6": "url"
  }
}
```

**الجديد (New):**
```json
{
  "colorImages": {
    "blue-500": "url",
    "blue-600": "url"
  }
}
```

## 🧪 الاختبار | Testing

تم إضافة ملف اختبار: `scripts/test-color-system.ts`

للتشغيل:
```bash
npx ts-node scripts/test-color-system.ts
```

## 📈 نقاط الأداء | Performance Notes

- استخدام debounce للبحث
- تخزين مؤقت للألوان والدرجات
- تقليل إعادة الرenderة
- حمل ديناميكي للدرجات عند الحاجة فقط

## 🔄 التوافقية العكسية | Backward Compatibility

النظام يدعم كلا الصيغة (الجديدة والقديمة) للتأكد من عدم كسر البيانات القديمة. يمكن إجراء migration تدريجي إذا لزم الأمر.

## 📞 للمساعدة | Support

- تحقق من `lib/types.ts` للدوال المساعدة
- انظر إلى `components/color-search-selector.tsx` لفهم الواجهة
- اطلع على `app/dashboard/add-product/page.tsx` لمثال الاستخدام

---

**آخر تحديث | Last Updated:** 2026-02-24
**النسخة | Version:** 1.0.0
