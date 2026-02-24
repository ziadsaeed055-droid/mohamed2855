/**
 * سكريبت تهيئة مستندات settings في Firebase
 *
 * كيفية الاستخدام:
 * 1. انسخ الكود أدناه
 * 2. افتح Firebase Console > Firestore Database
 * 3. أنشئ collection جديدة اسمها: settings
 * 4. أضف المستندات التالية يدوياً أو استخدم Firebase Admin SDK
 */

export const initialFeaturedProduct = {
  productId: "",
  titleAr: "",
  titleEn: "",
  descriptionAr: "",
  descriptionEn: "",
  badges: [],
  isActive: false,
}

export const initialFlashSale = {
  titleAr: "عروض سريعة",
  titleEn: "Flash Sale",
  discountPercent: 20,
  startDate: new Date(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // بعد أسبوع
  productIds: [],
  isActive: false,
}

/**
 * الخطوات المطلوبة في Firebase Console:
 *
 * 1. اذهب إلى: https://console.firebase.google.com
 * 2. اختر مشروعك
 * 3. من القائمة الجانبية: Firestore Database
 * 4. اضغط "Start collection"
 * 5. اسم الـ Collection: settings
 * 6. Document ID الأول: featuredProduct
 *    - أضف الحقول:
 *      productId: "" (string)
 *      titleAr: "" (string)
 *      titleEn: "" (string)
 *      descriptionAr: "" (string)
 *      descriptionEn: "" (string)
 *      badges: [] (array)
 *      isActive: false (boolean)
 *
 * 7. أضف Document ثاني بـ ID: flashSale
 *    - أضف الحقول:
 *      titleAr: "عروض سريعة" (string)
 *      titleEn: "Flash Sale" (string)
 *      discountPercent: 20 (number)
 *      startDate: (timestamp - اختر التاريخ الحالي)
 *      endDate: (timestamp - اختر تاريخ بعد أسبوع)
 *      productIds: [] (array)
 *      isActive: false (boolean)
 */
