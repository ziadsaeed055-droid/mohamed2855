export interface Product {
  id: string
  productCode: string // User-entered unique product code
  nameAr: string
  nameEn: string
  descriptionAr: string
  descriptionEn: string
  featuresAr: string[]
  featuresEn: string[]
  notesAr: string
  notesEn: string
  afterPurchaseNotesAr: string
  afterPurchaseNotesEn: string
  colors: ColorSelection[]  // Updated: Now uses ColorSelection with variants
  sizes: string[]
  mainImage: string
  additionalImages: string[]
  colorImages?: { [shadeId: string]: string } // Map shade ID (e.g., "blue-500") to product image URL
  colorSizeStock?: ColorSizeStock[] // Stock tracking for each color-size combination
  colorRatings?: ColorRating[] // Ratings for each color shade
  costPrice: number
  salePrice: number
  profit: number
  discount: number
  discountedPrice: number
  quantity: number
  alertQuantity: number
  tax: number
  isActive: boolean
  isFeatured: boolean
  category: string
  subCategory: string
  createdAt: Date
  updatedAt: Date
  productType: ProductType
  season?: "summer" | "winter" | "all" // Seasonal categorization
  salesCount?: number // Track number of sales for best sellers
  discountEndDate?: Date // For time-limited offers
  views?: number
  likes?: number
  likedBy?: string[] // Array of user IDs who liked the product
  tags?: string[] // Tags for smart matching
  relatedProductIds?: string[] // Manually selected related products
  outfitItems?: OutfitItem[]
  outfitSizeType?: "unified" | "individual" // unified = one size for all, individual = size per item
  bundleProductIds?: string[]
  bundleDiscount?: number
  giftCardValues?: number[]
  giftCardValidity?: number // days
  customOptions?: {
    nameAr: string
    nameEn: string
    type: "text" | "select" | "color"
    options?: string[]
    required: boolean
  }[]
  subscriptionPeriod?: "weekly" | "monthly" | "quarterly" | "yearly"
  subscriptionPrice?: number
}

export interface User {
  id: string
  email: string
  displayName: string
  photoURL: string
  phone: string
  address: string
  city: string
  country: string
  savedAddresses?: Address[]
  createdAt: Date
}

export interface CartItem {
  productId: string
  product: Product
  quantity: number
  selectedColor: string | ColorSelection  // Store as string (shadeId) for consistency
  selectedSize: string
  outfitSizes?: { [itemIndex: number]: string }
  customValues?: { [optionName: string]: string }
  giftCardValue?: number
  giftCardRecipientEmail?: string
  giftCardMessage?: string
}

// ==================== REVIEWS & RATINGS SYSTEM ====================
export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  userPhoto?: string
  rating: number // 1-5
  title: string
  comment: string
  images?: string[] // Photos from customer
  verified: boolean // Has customer purchased this product?
  helpful: number // How many found it helpful
  unhelpful: number // How many found it unhelpful
  response?: {
    text: string
    timestamp: Date
  }
  createdAt: Date
  updatedAt: Date
}

export interface ProductRating {
  productId: string
  averageRating: number // 1-5
  totalReviews: number
  ratingDistribution: {
    5: number // Count of 5-star reviews
    4: number
    3: number
    2: number
    1: number
  }
  recentReviews: Review[] // Latest reviews
}

// ==================== ORDER TRACKING SYSTEM ====================
export interface ShippingUpdate {
  status: "pending" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled"
  timestamp: Date
  location?: string
  notes?: string
  notifiedUser?: boolean
}

export interface Order {
  id: string
  userId: string
  userEmail: string
  userName: string
  userPhone: string
  userAddress: string
  userCity?: string
  userCountry?: string
  items: CartItem[]
  subtotal: number
  tax: number
  shippingCost?: number
  total: number
  paymentMethod?: "cash_on_delivery" | "online" | "bank_transfer"
  paymentStatus?: "pending" | "paid" | "failed"
  status: "pending" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled" | "refunded"
  shippingUpdates: ShippingUpdate[]
  trackingNumber?: string
  estimatedDeliveryDate?: Date
  actualDeliveryDate?: Date
  notes?: string
  adminNotes?: string
  createdAt: Date
  updatedAt: Date
}

// ================== HIERARCHICAL CATEGORY SYSTEM ==================

export interface SubSubCategory {
  id: string
  nameAr: string
  nameEn: string
}

export interface SubCategory {
  id: string
  nameAr: string
  nameEn: string
  subCategories?: SubSubCategory[] // Optional third level
}

export interface Category {
  id: string
  nameAr: string
  nameEn: string
  description?: string
  icon?: string
  subCategories: SubCategory[]
}

// ==================== MAIN CATEGORIES ====================
export const CATEGORIES: Category[] = [
  {
    id: "men",
    nameAr: "رجالي",
    nameEn: "Men",
    description: "تشكيلة الملابس الرجالية",
    icon: "Shirt",
    subCategories: [
      { id: "men-hoodies", nameAr: "هودي / سويت شيرت", nameEn: "Hoodies & Sweatshirts" },
      { id: "men-pullovers", nameAr: "بلوفر", nameEn: "Pullovers" },
      { id: "men-shirts-overshirts", nameAr: "قميص / قميص خارجي", nameEn: "Shirts & Overshirts" },
      { id: "men-jackets", nameAr: "جاكيتات", nameEn: "Jackets" },
      { id: "men-coats", nameAr: "معاطف", nameEn: "Coats" },
      { id: "men-tshirts", nameAr: "تيشيرتات", nameEn: "T-Shirts" },
      { id: "men-shirts", nameAr: "قمصان", nameEn: "Shirts" },
      { id: "men-jeans", nameAr: "جينز", nameEn: "Jeans" },
      { id: "men-sweatpants", nameAr: "بنطال رياضي", nameEn: "Sweatpants" },
      { id: "men-chinos", nameAr: "بنطال كاجوال", nameEn: "Chinos" },
      { id: "men-shorts", nameAr: "شورتات", nameEn: "Shorts" },
      { id: "men-swimming", nameAr: "ملابس سباحة", nameEn: "Swimming Sport" },
      { id: "men-homewear", nameAr: "ملابس بيتي", nameEn: "Homewear" },
    ],
  },
  {
    id: "women",
    nameAr: "حريمي",
    nameEn: "Women",
    description: "تشكيلة الملابس النسائية",
    icon: "Sparkles",
    subCategories: [
      { id: "women-dresses", nameAr: "فساتين", nameEn: "Dresses" },
      { id: "women-jumpsuit", nameAr: "جمبسوت", nameEn: "Jumpsuit" },
      { id: "women-tshirts", nameAr: "تيشيرتات", nameEn: "T-Shirts" },
      { id: "women-veil-scarf", nameAr: "حجاب وشال", nameEn: "Veil & Scarf" },
      { id: "women-scarves", nameAr: "طرح وأوشحة", nameEn: "Scarves & Wraps" },
      { id: "women-bags", nameAr: "شنط وحقائب", nameEn: "Bags & Handbags" },
      { id: "women-blouses", nameAr: "بلوزات", nameEn: "Blouses" },
      { id: "women-jackets-coats", nameAr: "جاكيتات ومعاطف", nameEn: "Jackets & Coats" },
      { id: "women-sweatshirts", nameAr: "سويت شيرتات", nameEn: "Sweatshirts" },
      { id: "women-activewear", nameAr: "ملابس رياضية", nameEn: "Activewear" },
      { id: "women-jeans", nameAr: "جينز", nameEn: "Jeans" },
      { id: "women-pants", nameAr: "بنطال رياضي", nameEn: "Pants" },
      { id: "women-chinos", nameAr: "بنطال كاجوال", nameEn: "Chinos" },
      { id: "women-skirts", nameAr: "جيبات", nameEn: "Skirts" },
      { id: "women-lingerie", nameAr: "لانجري", nameEn: "Lingerie" },
      { id: "women-swimwear", nameAr: "ملابس سباحة", nameEn: "Swimwear" },
      { id: "women-homewear", nameAr: "ملابس بيتي", nameEn: "Homewear" },
    ],
  },
  {
    id: "youth",
    nameAr: "شبابي",
    nameEn: "Youth",
    description: "تشكيلة الملابس الشبابية",
    icon: "Sparkles",
    subCategories: [
      // Youth Men's Section
      { id: "youth-men-hoodies", nameAr: "هودي وسويت (شبابي رجالي)", nameEn: "Hoodies & Sweatshirts (Youth Men)" },
      { id: "youth-men-tshirts", nameAr: "تيشيرتات (شبابي رجالي)", nameEn: "T-Shirts (Youth Men)" },
      { id: "youth-men-jackets", nameAr: "جاكيتات (شبابي رجالي)", nameEn: "Jackets (Youth Men)" },
      { id: "youth-men-jeans", nameAr: "جينز (شبابي رجالي)", nameEn: "Jeans (Youth Men)" },
      { id: "youth-men-pants", nameAr: "بنطال رياضي (شبابي رجالي)", nameEn: "Sweatpants (Youth Men)" },
      { id: "youth-men-chinos", nameAr: "بنطال كاجوال (شبابي رجالي)", nameEn: "Chinos (Youth Men)" },
      { id: "youth-men-shorts", nameAr: "شورتات (شبابي رجالي)", nameEn: "Shorts (Youth Men)" },
      { id: "youth-men-shirts", nameAr: "قمصان (شبابي رجالي)", nameEn: "Shirts (Youth Men)" },
      // Youth Women's Section
      { id: "youth-women-hoodies", nameAr: "هودي وسويت (شبابي حريمي)", nameEn: "Hoodies & Sweatshirts (Youth Women)" },
      { id: "youth-women-tshirts", nameAr: "تيشيرتات (شبابي حريمي)", nameEn: "T-Shirts (Youth Women)" },
      { id: "youth-women-dresses", nameAr: "فساتين (شبابي حريمي)", nameEn: "Dresses (Youth Women)" },
      { id: "youth-women-jackets", nameAr: "جاكيتات (شبابي حريمي)", nameEn: "Jackets (Youth Women)" },
      { id: "youth-women-jeans", nameAr: "جينز (شبابي حريمي)", nameEn: "Jeans (Youth Women)" },
      { id: "youth-women-pants", nameAr: "بنطال رياضي (شبابي حريمي)", nameEn: "Sweatpants (Youth Women)" },
      { id: "youth-women-skirts", nameAr: "جيبات (شبابي حريمي)", nameEn: "Skirts (Youth Women)" },
      { id: "youth-women-shirts", nameAr: "قمصان (شبابي حريمي)", nameEn: "Shirts (Youth Women)" },
    ],
  },
  {
    id: "kids",
    nameAr: "أطفالي",
    nameEn: "Kids",
    description: "تشكيلة ملابس الأطفال",
    icon: "Baby",
    subCategories: [
      { id: "kids-hoodies", nameAr: "هودي وسويت شيرت", nameEn: "Hoodies & Sweatshirts" },
      { id: "kids-pullovers", nameAr: "بلوفر", nameEn: "Pullovers" },
      { id: "kids-shirts-overshirts", nameAr: "قميص / قميص خارجي", nameEn: "Shirts & Overshirts" },
      { id: "kids-jackets", nameAr: "جاكيتات", nameEn: "Jackets" },
      { id: "kids-tshirts", nameAr: "تيشيرتات", nameEn: "T-Shirts" },
      { id: "kids-shirts", nameAr: "قمصان", nameEn: "Shirts" },
      { id: "kids-jeans", nameAr: "جينز", nameEn: "Jeans" },
      { id: "kids-chinos", nameAr: "بنطال كاجوال", nameEn: "Chinos" },
      { id: "kids-sweatpants", nameAr: "بنطال رياضي", nameEn: "Sweatpants" },
      { id: "kids-shorts", nameAr: "شورتات", nameEn: "Shorts" },
      { id: "kids-swimming", nameAr: "ملابس سباحة", nameEn: "Swimming Sport" },
      { id: "kids-homewear", nameAr: "ملابس بيتي", nameEn: "Homewear" },
    ],
  },
]

// ==================== FLAT SUB CATEGORIES (auto-generated from CATEGORIES) ====================
export const SUB_CATEGORIES = CATEGORIES.flatMap((cat) =>
  cat.subCategories.map((sub) => ({
    id: sub.id,
    nameAr: sub.nameAr,
    nameEn: sub.nameEn,
    parentCategoryId: cat.id,
  }))
)

// ==================== HELPER: Generate Product Code ====================
export function generateProductCode(count: number): string {
  return `SB-${String(count + 1).padStart(5, "0")}`
}

// ==================== HELPER: Find category/subcategory by ID ====================
export function findCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.id === id)
}

export function findSubCategoryById(id: string): { category: Category; subCategory: SubCategory } | undefined {
  for (const cat of CATEGORIES) {
    const sub = cat.subCategories.find((s) => s.id === id)
    if (sub) return { category: cat, subCategory: sub }
  }
  return undefined
}

// ================== COLOR VARIANTS SYSTEM ==================
export interface ColorVariant {
  id: string                    // "blue-100", "blue-500", "blue-900"
  nameAr: string               // "أزرق فاتح جداً"
  nameEn: string               // "Very Light Blue"
  hex: string                  // "#3b82f6"
  shade: number                // 100-900 (50, 100, 200, 300, 400, 500, 600, 700, 800, 900)
  parentColorId: string        // "blue" - الرابط للون الأساسي
  shadeNameAr: string          // "فاتح جداً", "فاتح", "متوسط", "غامق", "غامق جداً"
  shadeNameEn: string          // "Very Light", "Light", "Medium", "Dark", "Very Dark"
}

export interface BaseColor {
  id: string                   // "black", "blue", "red"
  nameAr: string
  nameEn: string
  variants: ColorVariant[]     // جميع الدرجات
  displayColor?: string        // لون العرض الافتراضي (عادة الدرجة 500)
}

export interface ColorSelection {
  colorId: string              // المجموعة الأساسية: "blue"
  shadeId: string             // معرف الدرجة: "blue-500"
  label: string               // العرض الكامل: "أزرق متوسط" / "Blue Medium"
}

export interface ColorSizeStock {
  shadeId: string             // "blue-500"
  size: string                // "S", "M", "L", "XL"
  quantity: number            // الكمية المتاحة
  reservedQuantity?: number   // الكمية المحجوزة
  isLowStock?: boolean        // تنبيه عند انخفاض المخزون
}

export interface ColorRating {
  shadeId: string             // "blue-500"
  averageRating: number       // 1-5
  reviewCount: number         // عدد التقييمات
  colorAccuracyRating: number // دقة اللون في الصورة
  popularityScore: number     // معدل الشراء
}

// ================== COLOR SYSTEM ==================
export const COLOR_SHADES = {
  50: { ar: "فاتح جداً جداً", en: "Ultra Light" },
  100: { ar: "فاتح جداً", en: "Very Light" },
  200: { ar: "فاتح", en: "Light" },
  300: { ar: "فاتح نسبياً", en: "Somewhat Light" },
  400: { ar: "فاتح قليلاً", en: "Slightly Light" },
  500: { ar: "متوسط", en: "Medium" },
  600: { ar: "غامق قليلاً", en: "Slightly Dark" },
  700: { ar: "غامق نسبياً", en: "Somewhat Dark" },
  800: { ar: "غامق", en: "Dark" },
  900: { ar: "غامق جداً", en: "Very Dark" },
} as const

// Base color definitions with variants
export const COLORS: BaseColor[] = [
  {
    id: "black",
    nameAr: "أسود",
    nameEn: "Black",
    displayColor: "#000000",
    variants: [
      { id: "black-900", nameAr: "أسود", nameEn: "Black", hex: "#000000", shade: 900, parentColorId: "black", shadeNameAr: "أسود", shadeNameEn: "Black" }
    ]
  },
  {
    id: "white",
    nameAr: "أبيض",
    nameEn: "White",
    displayColor: "#FFFFFF",
    variants: [
      { id: "white-50", nameAr: "أبيض", nameEn: "White", hex: "#FFFFFF", shade: 50, parentColorId: "white", shadeNameAr: "أبيض", shadeNameEn: "White" }
    ]
  },
  {
    id: "navy",
    nameAr: "كحلي",
    nameEn: "Navy",
    displayColor: "#1e3a8a",
    variants: [
      { id: "navy-100", nameAr: "كحلي فاتح جداً", nameEn: "Navy Very Light", hex: "#e0e7ff", shade: 100, parentColorId: "navy", shadeNameAr: "فاتح جداً", shadeNameEn: "Very Light" },
      { id: "navy-200", nameAr: "كحلي فاتح", nameEn: "Navy Light", hex: "#c7d2fe", shade: 200, parentColorId: "navy", shadeNameAr: "فاتح", shadeNameEn: "Light" },
      { id: "navy-300", nameAr: "كحلي فاتح نسبياً", nameEn: "Navy Somewhat Light", hex: "#a5b4fc", shade: 300, parentColorId: "navy", shadeNameAr: "فاتح نسبياً", shadeNameEn: "Somewhat Light" },
      { id: "navy-400", nameAr: "كحلي فاتح قليلاً", nameEn: "Navy Slightly Light", hex: "#818cf8", shade: 400, parentColorId: "navy", shadeNameAr: "فاتح قليلاً", shadeNameEn: "Slightly Light" },
      { id: "navy-500", nameAr: "كحلي متوسط", nameEn: "Navy Medium", hex: "#6366f1", shade: 500, parentColorId: "navy", shadeNameAr: "متوسط", shadeNameEn: "Medium" },
      { id: "navy-600", nameAr: "كحلي غامق قليلاً", nameEn: "Navy Slightly Dark", hex: "#4f46e5", shade: 600, parentColorId: "navy", shadeNameAr: "غامق قليلاً", shadeNameEn: "Slightly Dark" },
      { id: "navy-700", nameAr: "كحلي غامق نسبياً", nameEn: "Navy Somewhat Dark", hex: "#4338ca", shade: 700, parentColorId: "navy", shadeNameAr: "غامق نسبياً", shadeNameEn: "Somewhat Dark" },
      { id: "navy-800", nameAr: "كحلي غامق", nameEn: "Navy Dark", hex: "#3730a3", shade: 800, parentColorId: "navy", shadeNameAr: "غامق", shadeNameEn: "Dark" },
      { id: "navy-900", nameAr: "كحلي غامق جداً", nameEn: "Navy Very Dark", hex: "#1e3a8a", shade: 900, parentColorId: "navy", shadeNameAr: "غامق جداً", shadeNameEn: "Very Dark" }
    ]
  },
  {
    id: "blue",
    nameAr: "أزرق",
    nameEn: "Blue",
    displayColor: "#3b82f6",
    variants: [
      { id: "blue-50", nameAr: "أزرق فاتح جداً جداً", nameEn: "Blue Ultra Light", hex: "#eff6ff", shade: 50, parentColorId: "blue", shadeNameAr: "فاتح جداً جداً", shadeNameEn: "Ultra Light" },
      { id: "blue-100", nameAr: "أزرق فاتح جداً", nameEn: "Blue Very Light", hex: "#dbeafe", shade: 100, parentColorId: "blue", shadeNameAr: "فاتح جداً", shadeNameEn: "Very Light" },
      { id: "blue-200", nameAr: "أزرق فاتح", nameEn: "Blue Light", hex: "#bfdbfe", shade: 200, parentColorId: "blue", shadeNameAr: "فاتح", shadeNameEn: "Light" },
      { id: "blue-300", nameAr: "أزرق فاتح نسبياً", nameEn: "Blue Somewhat Light", hex: "#93c5fd", shade: 300, parentColorId: "blue", shadeNameAr: "فاتح نسبياً", shadeNameEn: "Somewhat Light" },
      { id: "blue-400", nameAr: "أزرق فاتح قليلاً", nameEn: "Blue Slightly Light", hex: "#60a5fa", shade: 400, parentColorId: "blue", shadeNameAr: "فاتح قليلاً", shadeNameEn: "Slightly Light" },
      { id: "blue-500", nameAr: "أزرق متوسط", nameEn: "Blue Medium", hex: "#3b82f6", shade: 500, parentColorId: "blue", shadeNameAr: "متوسط", shadeNameEn: "Medium" },
      { id: "blue-600", nameAr: "أزرق غامق قليلاً", nameEn: "Blue Slightly Dark", hex: "#2563eb", shade: 600, parentColorId: "blue", shadeNameAr: "غامق قليلاً", shadeNameEn: "Slightly Dark" },
      { id: "blue-700", nameAr: "أزرق غامق نسبياً", nameEn: "Blue Somewhat Dark", hex: "#1d4ed8", shade: 700, parentColorId: "blue", shadeNameAr: "غامق نسبياً", shadeNameEn: "Somewhat Dark" },
      { id: "blue-800", nameAr: "أزرق غامق", nameEn: "Blue Dark", hex: "#1e40af", shade: 800, parentColorId: "blue", shadeNameAr: "غامق", shadeNameEn: "Dark" },
      { id: "blue-900", nameAr: "أزرق غامق جداً", nameEn: "Blue Very Dark", hex: "#1e3a8a", shade: 900, parentColorId: "blue", shadeNameAr: "غامق جداً", shadeNameEn: "Very Dark" }
    ]
  },
  {
    id: "sky-blue",
    nameAr: "أزرق سماوي",
    nameEn: "Sky Blue",
    displayColor: "#0ea5e9",
    variants: [
      { id: "sky-blue-50", nameAr: "أزرق سماوي فاتح جداً جداً", nameEn: "Sky Blue Ultra Light", hex: "#f0f9ff", shade: 50, parentColorId: "sky-blue", shadeNameAr: "فاتح جداً جداً", shadeNameEn: "Ultra Light" },
      { id: "sky-blue-100", nameAr: "أزرق سماوي فاتح جداً", nameEn: "Sky Blue Very Light", hex: "#e0f2fe", shade: 100, parentColorId: "sky-blue", shadeNameAr: "فاتح جداً", shadeNameEn: "Very Light" },
      { id: "sky-blue-200", nameAr: "أزرق سماوي فاتح", nameEn: "Sky Blue Light", hex: "#bae6fd", shade: 200, parentColorId: "sky-blue", shadeNameAr: "فاتح", shadeNameEn: "Light" },
      { id: "sky-blue-300", nameAr: "أزرق سماوي فاتح نسبياً", nameEn: "Sky Blue Somewhat Light", hex: "#7dd3fc", shade: 300, parentColorId: "sky-blue", shadeNameAr: "فاتح نسبياً", shadeNameEn: "Somewhat Light" },
      { id: "sky-blue-400", nameAr: "أزرق سماوي فاتح قليلاً", nameEn: "Sky Blue Slightly Light", hex: "#38bdf8", shade: 400, parentColorId: "sky-blue", shadeNameAr: "فاتح قليلاً", shadeNameEn: "Slightly Light" },
      { id: "sky-blue-500", nameAr: "أزرق سماوي متوسط", nameEn: "Sky Blue Medium", hex: "#0ea5e9", shade: 500, parentColorId: "sky-blue", shadeNameAr: "متوسط", shadeNameEn: "Medium" },
      { id: "sky-blue-600", nameAr: "أزرق سماوي غامق قليلاً", nameEn: "Sky Blue Slightly Dark", hex: "#0284c7", shade: 600, parentColorId: "sky-blue", shadeNameAr: "غامق قليلاً", shadeNameEn: "Slightly Dark" },
      { id: "sky-blue-700", nameAr: "أزرق سماوي غامق نسبياً", nameEn: "Sky Blue Somewhat Dark", hex: "#0369a1", shade: 700, parentColorId: "sky-blue", shadeNameAr: "غامق نسبياً", shadeNameEn: "Somewhat Dark" },
      { id: "sky-blue-800", nameAr: "أزرق سماوي غامق", nameEn: "Sky Blue Dark", hex: "#075985", shade: 800, parentColorId: "sky-blue", shadeNameAr: "غامق", shadeNameEn: "Dark" },
      { id: "sky-blue-900", nameAr: "أزرق سماوي غامق جداً", nameEn: "Sky Blue Very Dark", hex: "#0c4a6e", shade: 900, parentColorId: "sky-blue", shadeNameAr: "غامق جداً", shadeNameEn: "Very Dark" }
    ]
  },
  {
    id: "red",
    nameAr: "أحمر",
    nameEn: "Red",
    displayColor: "#ef4444",
    variants: [
      { id: "red-50", nameAr: "أحمر فاتح جداً جداً", nameEn: "Red Ultra Light", hex: "#fef2f2", shade: 50, parentColorId: "red", shadeNameAr: "فاتح جداً جداً", shadeNameEn: "Ultra Light" },
      { id: "red-100", nameAr: "أحمر فاتح جداً", nameEn: "Red Very Light", hex: "#fee2e2", shade: 100, parentColorId: "red", shadeNameAr: "فاتح جداً", shadeNameEn: "Very Light" },
      { id: "red-200", nameAr: "أحمر فاتح", nameEn: "Red Light", hex: "#fecaca", shade: 200, parentColorId: "red", shadeNameAr: "فاتح", shadeNameEn: "Light" },
      { id: "red-300", nameAr: "أحمر فاتح نسبياً", nameEn: "Red Somewhat Light", hex: "#fca5a5", shade: 300, parentColorId: "red", shadeNameAr: "فاتح نسبياً", shadeNameEn: "Somewhat Light" },
      { id: "red-400", nameAr: "أحمر فاتح قليلاً", nameEn: "Red Slightly Light", hex: "#f87171", shade: 400, parentColorId: "red", shadeNameAr: "فاتح قليلاً", shadeNameEn: "Slightly Light" },
      { id: "red-500", nameAr: "أحمر متوسط", nameEn: "Red Medium", hex: "#ef4444", shade: 500, parentColorId: "red", shadeNameAr: "متوسط", shadeNameEn: "Medium" },
      { id: "red-600", nameAr: "أحمر غامق قليلاً", nameEn: "Red Slightly Dark", hex: "#dc2626", shade: 600, parentColorId: "red", shadeNameAr: "غامق قليلاً", shadeNameEn: "Slightly Dark" },
      { id: "red-700", nameAr: "أحمر غامق نسبياً", nameEn: "Red Somewhat Dark", hex: "#b91c1c", shade: 700, parentColorId: "red", shadeNameAr: "غامق نسبياً", shadeNameEn: "Somewhat Dark" },
      { id: "red-800", nameAr: "أحمر غامق", nameEn: "Red Dark", hex: "#991b1b", shade: 800, parentColorId: "red", shadeNameAr: "غامق", shadeNameEn: "Dark" },
      { id: "red-900", nameAr: "أحمر غامق جداً", nameEn: "Red Very Dark", hex: "#7f1d1d", shade: 900, parentColorId: "red", shadeNameAr: "غامق جداً", shadeNameEn: "Very Dark" }
    ]
  },
  {
    id: "green",
    nameAr: "أخضر",
    nameEn: "Green",
    displayColor: "#22c55e",
    variants: [
      { id: "green-50", nameAr: "أخضر فاتح جداً جداً", nameEn: "Green Ultra Light", hex: "#f0fdf4", shade: 50, parentColorId: "green", shadeNameAr: "فاتح جداً جداً", shadeNameEn: "Ultra Light" },
      { id: "green-100", nameAr: "أخضر فاتح جداً", nameEn: "Green Very Light", hex: "#dcfce7", shade: 100, parentColorId: "green", shadeNameAr: "فاتح جداً", shadeNameEn: "Very Light" },
      { id: "green-200", nameAr: "أخضر فاتح", nameEn: "Green Light", hex: "#bbf7d0", shade: 200, parentColorId: "green", shadeNameAr: "فاتح", shadeNameEn: "Light" },
      { id: "green-300", nameAr: "أخضر فاتح نسبياً", nameEn: "Green Somewhat Light", hex: "#86efac", shade: 300, parentColorId: "green", shadeNameAr: "فاتح نسبياً", shadeNameEn: "Somewhat Light" },
      { id: "green-400", nameAr: "أخضر فاتح قليلاً", nameEn: "Green Slightly Light", hex: "#4ade80", shade: 400, parentColorId: "green", shadeNameAr: "فاتح قليلاً", shadeNameEn: "Slightly Light" },
      { id: "green-500", nameAr: "أخضر متوسط", nameEn: "Green Medium", hex: "#22c55e", shade: 500, parentColorId: "green", shadeNameAr: "متوسط", shadeNameEn: "Medium" },
      { id: "green-600", nameAr: "أخضر غامق قليلاً", nameEn: "Green Slightly Dark", hex: "#16a34a", shade: 600, parentColorId: "green", shadeNameAr: "غامق قليلاً", shadeNameEn: "Slightly Dark" },
      { id: "green-700", nameAr: "أخضر غامق نسبياً", nameEn: "Green Somewhat Dark", hex: "#15803d", shade: 700, parentColorId: "green", shadeNameAr: "غامق نسبياً", shadeNameEn: "Somewhat Dark" },
      { id: "green-800", nameAr: "أخضر غامق", nameEn: "Green Dark", hex: "#166534", shade: 800, parentColorId: "green", shadeNameAr: "غامق", shadeNameEn: "Dark" },
      { id: "green-900", nameAr: "أخضر غامق جداً", nameEn: "Green Very Dark", hex: "#14532d", shade: 900, parentColorId: "green", shadeNameAr: "غامق جداً", shadeNameEn: "Very Dark" }
    ]
  },
  {
    id: "teal",
    nameAr: "أزرق مخضر",
    nameEn: "Teal",
    displayColor: "#14b8a6",
    variants: [
      { id: "teal-50", nameAr: "أزرق مخضر فاتح جداً جداً", nameEn: "Teal Ultra Light", hex: "#f0fdfa", shade: 50, parentColorId: "teal", shadeNameAr: "فاتح جداً جداً", shadeNameEn: "Ultra Light" },
      { id: "teal-100", nameAr: "أزرق مخضر فاتح جداً", nameEn: "Teal Very Light", hex: "#ccfbf1", shade: 100, parentColorId: "teal", shadeNameAr: "فاتح جداً", shadeNameEn: "Very Light" },
      { id: "teal-200", nameAr: "أزرق مخضر فاتح", nameEn: "Teal Light", hex: "#99f6e4", shade: 200, parentColorId: "teal", shadeNameAr: "فاتح", shadeNameEn: "Light" },
      { id: "teal-300", nameAr: "أزرق مخضر فاتح نسبياً", nameEn: "Teal Somewhat Light", hex: "#5ee7df", shade: 300, parentColorId: "teal", shadeNameAr: "فاتح نسبياً", shadeNameEn: "Somewhat Light" },
      { id: "teal-400", nameAr: "أزرق مخضر فاتح قليلاً", nameEn: "Teal Slightly Light", hex: "#2dd4bf", shade: 400, parentColorId: "teal", shadeNameAr: "فاتح قليلاً", shadeNameEn: "Slightly Light" },
      { id: "teal-500", nameAr: "أزرق مخضر متوسط", nameEn: "Teal Medium", hex: "#14b8a6", shade: 500, parentColorId: "teal", shadeNameAr: "متوسط", shadeNameEn: "Medium" },
      { id: "teal-600", nameAr: "أزرق مخضر غامق قليلاً", nameEn: "Teal Slightly Dark", hex: "#0d9488", shade: 600, parentColorId: "teal", shadeNameAr: "غامق قليلاً", shadeNameEn: "Slightly Dark" },
      { id: "teal-700", nameAr: "أزرق مخضر غامق نسبياً", nameEn: "Teal Somewhat Dark", hex: "#0f766e", shade: 700, parentColorId: "teal", shadeNameAr: "غامق نسبياً", shadeNameEn: "Somewhat Dark" },
      { id: "teal-800", nameAr: "أزرق مخضر غامق", nameEn: "Teal Dark", hex: "#115e59", shade: 800, parentColorId: "teal", shadeNameAr: "غامق", shadeNameEn: "Dark" },
      { id: "teal-900", nameAr: "أزرق مخضر غامق جداً", nameEn: "Teal Very Dark", hex: "#134e4a", shade: 900, parentColorId: "teal", shadeNameAr: "غامق جداً", shadeNameEn: "Very Dark" }
    ]
  },
  {
    id: "gray",
    nameAr: "رمادي",
    nameEn: "Gray",
    displayColor: "#6b7280",
    variants: [
      { id: "gray-50", nameAr: "رمادي فاتح جداً جداً", nameEn: "Gray Ultra Light", hex: "#f9fafb", shade: 50, parentColorId: "gray", shadeNameAr: "فاتح جداً جداً", shadeNameEn: "Ultra Light" },
      { id: "gray-100", nameAr: "رمادي فاتح جداً", nameEn: "Gray Very Light", hex: "#f3f4f6", shade: 100, parentColorId: "gray", shadeNameAr: "فاتح جداً", shadeNameEn: "Very Light" },
      { id: "gray-200", nameAr: "رمادي فاتح", nameEn: "Gray Light", hex: "#e5e7eb", shade: 200, parentColorId: "gray", shadeNameAr: "فاتح", shadeNameEn: "Light" },
      { id: "gray-300", nameAr: "رمادي فاتح نسبياً", nameEn: "Gray Somewhat Light", hex: "#d1d5db", shade: 300, parentColorId: "gray", shadeNameAr: "فاتح نسبياً", shadeNameEn: "Somewhat Light" },
      { id: "gray-400", nameAr: "رمادي فاتح قليلاً", nameEn: "Gray Slightly Light", hex: "#9ca3af", shade: 400, parentColorId: "gray", shadeNameAr: "فاتح قليلاً", shadeNameEn: "Slightly Light" },
      { id: "gray-500", nameAr: "رمادي متوسط", nameEn: "Gray Medium", hex: "#6b7280", shade: 500, parentColorId: "gray", shadeNameAr: "متوسط", shadeNameEn: "Medium" },
      { id: "gray-600", nameAr: "رمادي غامق قليلاً", nameEn: "Gray Slightly Dark", hex: "#4b5563", shade: 600, parentColorId: "gray", shadeNameAr: "غامق قليلاً", shadeNameEn: "Slightly Dark" },
      { id: "gray-700", nameAr: "رمادي غامق نسبياً", nameEn: "Gray Somewhat Dark", hex: "#374151", shade: 700, parentColorId: "gray", shadeNameAr: "غامق نسبياً", shadeNameEn: "Somewhat Dark" },
      { id: "gray-800", nameAr: "رمادي غامق", nameEn: "Gray Dark", hex: "#1f2937", shade: 800, parentColorId: "gray", shadeNameAr: "غامق", shadeNameEn: "Dark" },
      { id: "gray-900", nameAr: "رمادي غامق جداً", nameEn: "Gray Very Dark", hex: "#111827", shade: 900, parentColorId: "gray", shadeNameAr: "غامق جداً", shadeNameEn: "Very Dark" }
    ]
  },
  {
    id: "brown",
    nameAr: "بني",
    nameEn: "Brown",
    displayColor: "#92400e",
    variants: [
      { id: "brown-50", nameAr: "بني فاتح جداً جداً", nameEn: "Brown Ultra Light", hex: "#fefce8", shade: 50, parentColorId: "brown", shadeNameAr: "فاتح جداً جداً", shadeNameEn: "Ultra Light" },
      { id: "brown-100", nameAr: "بني فاتح جداً", nameEn: "Brown Very Light", hex: "#fef3c7", shade: 100, parentColorId: "brown", shadeNameAr: "فاتح جداً", shadeNameEn: "Very Light" },
      { id: "brown-200", nameAr: "بني فاتح", nameEn: "Brown Light", hex: "#fde68a", shade: 200, parentColorId: "brown", shadeNameAr: "فاتح", shadeNameEn: "Light" },
      { id: "brown-300", nameAr: "بني فاتح نسبياً", nameEn: "Brown Somewhat Light", hex: "#fcd34d", shade: 300, parentColorId: "brown", shadeNameAr: "فاتح نسبياً", shadeNameEn: "Somewhat Light" },
      { id: "brown-400", nameAr: "بني فاتح قليلاً", nameEn: "Brown Slightly Light", hex: "#fbbf24", shade: 400, parentColorId: "brown", shadeNameAr: "فاتح قليلاً", shadeNameEn: "Slightly Light" },
      { id: "brown-500", nameAr: "بني متوسط", nameEn: "Brown Medium", hex: "#f59e0b", shade: 500, parentColorId: "brown", shadeNameAr: "متوسط", shadeNameEn: "Medium" },
      { id: "brown-600", nameAr: "بني غامق قليلاً", nameEn: "Brown Slightly Dark", hex: "#d97706", shade: 600, parentColorId: "brown", shadeNameAr: "غامق قليلاً", shadeNameEn: "Slightly Dark" },
      { id: "brown-700", nameAr: "بني غامق نسبياً", nameEn: "Brown Somewhat Dark", hex: "#b45309", shade: 700, parentColorId: "brown", shadeNameAr: "غامق نسبياً", shadeNameEn: "Somewhat Dark" },
      { id: "brown-800", nameAr: "بني غامق", nameEn: "Brown Dark", hex: "#92400e", shade: 800, parentColorId: "brown", shadeNameAr: "غامق", shadeNameEn: "Dark" },
      { id: "brown-900", nameAr: "بني غامق جداً", nameEn: "Brown Very Dark", hex: "#78350f", shade: 900, parentColorId: "brown", shadeNameAr: "غامق جداً", shadeNameEn: "Very Dark" }
    ]
  },
  {
    id: "pink",
    nameAr: "وردي",
    nameEn: "Pink",
    displayColor: "#ec4899",
    variants: [
      { id: "pink-50", nameAr: "وردي فاتح جداً جداً", nameEn: "Pink Ultra Light", hex: "#fdf2f8", shade: 50, parentColorId: "pink", shadeNameAr: "فاتح جداً جداً", shadeNameEn: "Ultra Light" },
      { id: "pink-100", nameAr: "وردي فاتح جداً", nameEn: "Pink Very Light", hex: "#fce7f3", shade: 100, parentColorId: "pink", shadeNameAr: "فاتح جداً", shadeNameEn: "Very Light" },
      { id: "pink-200", nameAr: "وردي فاتح", nameEn: "Pink Light", hex: "#fbcfe8", shade: 200, parentColorId: "pink", shadeNameAr: "فاتح", shadeNameEn: "Light" },
      { id: "pink-300", nameAr: "وردي فاتح نسبياً", nameEn: "Pink Somewhat Light", hex: "#f8bbd0", shade: 300, parentColorId: "pink", shadeNameAr: "فاتح نسبياً", shadeNameEn: "Somewhat Light" },
      { id: "pink-400", nameAr: "وردي فاتح قليلاً", nameEn: "Pink Slightly Light", hex: "#f472b6", shade: 400, parentColorId: "pink", shadeNameAr: "فاتح قليلاً", shadeNameEn: "Slightly Light" },
      { id: "pink-500", nameAr: "وردي متوسط", nameEn: "Pink Medium", hex: "#ec4899", shade: 500, parentColorId: "pink", shadeNameAr: "متوسط", shadeNameEn: "Medium" },
      { id: "pink-600", nameAr: "وردي غامق قليلاً", nameEn: "Pink Slightly Dark", hex: "#db2777", shade: 600, parentColorId: "pink", shadeNameAr: "غامق قليلاً", shadeNameEn: "Slightly Dark" },
      { id: "pink-700", nameAr: "وردي غامق نسبياً", nameEn: "Pink Somewhat Dark", hex: "#be185d", shade: 700, parentColorId: "pink", shadeNameAr: "غامق نسبياً", shadeNameEn: "Somewhat Dark" },
      { id: "pink-800", nameAr: "وردي غامق", nameEn: "Pink Dark", hex: "#9d174d", shade: 800, parentColorId: "pink", shadeNameAr: "غامق", shadeNameEn: "Dark" },
      { id: "pink-900", nameAr: "وردي غامق جداً", nameEn: "Pink Very Dark", hex: "#831843", shade: 900, parentColorId: "pink", shadeNameAr: "غامق جداً", shadeNameEn: "Very Dark" }
    ]
  },
  {
    id: "orange",
    nameAr: "برتقالي",
    nameEn: "Orange",
    displayColor: "#f97316",
    variants: [
      { id: "orange-50", nameAr: "برتقالي فاتح جداً جداً", nameEn: "Orange Ultra Light", hex: "#fff7ed", shade: 50, parentColorId: "orange", shadeNameAr: "فاتح جداً جداً", shadeNameEn: "Ultra Light" },
      { id: "orange-100", nameAr: "برتقالي فاتح جداً", nameEn: "Orange Very Light", hex: "#ffedd5", shade: 100, parentColorId: "orange", shadeNameAr: "فاتح جداً", shadeNameEn: "Very Light" },
      { id: "orange-200", nameAr: "برتقالي فاتح", nameEn: "Orange Light", hex: "#fed7aa", shade: 200, parentColorId: "orange", shadeNameAr: "فاتح", shadeNameEn: "Light" },
      { id: "orange-300", nameAr: "برتقالي فاتح نسبياً", nameEn: "Orange Somewhat Light", hex: "#fdba74", shade: 300, parentColorId: "orange", shadeNameAr: "فاتح نسبياً", shadeNameEn: "Somewhat Light" },
      { id: "orange-400", nameAr: "برتقالي فاتح قليلاً", nameEn: "Orange Slightly Light", hex: "#fb923c", shade: 400, parentColorId: "orange", shadeNameAr: "فاتح قليلاً", shadeNameEn: "Slightly Light" },
      { id: "orange-500", nameAr: "برتقالي متوسط", nameEn: "Orange Medium", hex: "#f97316", shade: 500, parentColorId: "orange", shadeNameAr: "متوسط", shadeNameEn: "Medium" },
      { id: "orange-600", nameAr: "برتقالي غامق قليلاً", nameEn: "Orange Slightly Dark", hex: "#ea580c", shade: 600, parentColorId: "orange", shadeNameAr: "غامق قليلاً", shadeNameEn: "Slightly Dark" },
      { id: "orange-700", nameAr: "برتقالي غامق نسبياً", nameEn: "Orange Somewhat Dark", hex: "#c2410c", shade: 700, parentColorId: "orange", shadeNameAr: "غامق نسبياً", shadeNameEn: "Somewhat Dark" },
      { id: "orange-800", nameAr: "برتقالي غامق", nameEn: "Orange Dark", hex: "#9a3412", shade: 800, parentColorId: "orange", shadeNameAr: "غامق", shadeNameEn: "Dark" },
      { id: "orange-900", nameAr: "برتقالي غامق جداً", nameEn: "Orange Very Dark", hex: "#7c2d12", shade: 900, parentColorId: "orange", shadeNameAr: "غامق جداً", shadeNameEn: "Very Dark" }
    ]
  },
]

// ================== HELPER FUNCTIONS ==================

/**
 * Get all variants of a specific color
 */
export function getColorVariants(colorId: string): ColorVariant[] {
  const color = COLORS.find(c => c.id === colorId)
  return color?.variants || []
}

/**
 * Search colors by name (Arabic or English)
 */
export function searchColorsByName(query: string): BaseColor[] {
  const lowerQuery = query.toLowerCase()
  return COLORS.filter(color =>
    color.nameAr.toLowerCase().includes(lowerQuery) ||
    color.nameEn.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Get a specific variant by ID
 */
export function getColorVariantById(variantId: string): ColorVariant | undefined {
  for (const color of COLORS) {
    const variant = color.variants.find(v => v.id === variantId)
    if (variant) return variant
  }
  return undefined
}

/**
 * Get color label (display name) with shade
 */
export function getColorLabel(colorId: string, shadeId: string, lang: "ar" | "en" = "ar"): string {
  const variant = getColorVariantById(shadeId)
  if (!variant) return colorId
  return lang === "ar" ? variant.nameAr : variant.nameEn
}

export const SIZES = [
  "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL",
  "6XL", "7XL", "8XL", "9XL", "10XL", "11XL",
  "Free Size", "One Size", "Big Size", "Over Size",
]

export type NotificationType =
  | "welcome"
  | "order_confirmed"
  | "order_status"
  | "promotion"
  | "product"
  | "login"
  | "system"
  | "referral_success"
  | "points_earned"
  | "points_expiring"
  | "reward_redeemed"
  | "new_product"

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  titleAr: string
  titleEn: string
  messageAr: string
  messageEn: string
  actionUrl?: string
  orderData?: Record<string, any>
  isRead: boolean
  createdAt: Date
  updatedAt?: Date
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderRole: "user" | "admin"
  senderPhotoURL?: string
  content: string
  createdAt: Date
  isRead: boolean
  isTemporary?: boolean
}

export interface Conversation {
  id: string
  userId: string
  userName: string
  userEmail: string
  adminId?: string
  adminName?: string
  subject: string
  lastMessage: string
  lastMessageTime: Date
  isOpen: boolean
  unreadCount: number
  createdAt: Date
  updatedAt: Date
}

export interface Address {
  id: string
  label: string // "Home", "Work", "Other"
  street: string
  city: string
  phone: string
  secondPhone?: string
  isDefault: boolean
  latitude?: number
  longitude?: number
  createdAt: Date
}

export type ProductType = "single" | "outfit" | "bundle" | "gift" | "custom" | "subscription"

export const PRODUCT_TYPES = [
  { id: "single", nameAr: "منتج فردي", nameEn: "Single Product", icon: "Package" },
  { id: "outfit", nameAr: "طقم", nameEn: "Outfit / Set", icon: "Layers" },
  { id: "bundle", nameAr: "باقة", nameEn: "Bundle", icon: "Gift" },
  { id: "gift", nameAr: "بطاقة هدية", nameEn: "Gift Card", icon: "CreditCard" },
  { id: "custom", nameAr: "منتج مخصص", nameEn: "Custom Product", icon: "Wand2" },
  { id: "subscription", nameAr: "اشتراك", nameEn: "Subscription", icon: "RefreshCw" },
] as const

export interface OutfitItem {
  productId?: string // Optional - can be linked to existing product
  nameAr: string
  nameEn: string
  type: string // shirt, pants, etc.
  image?: string
}

export const OUTFIT_ITEM_TYPES = [
  { id: "shirt", nameAr: "قميص", nameEn: "Shirt" },
  { id: "pants", nameAr: "بنطلون", nameEn: "Pants" },
  { id: "jacket", nameAr: "جاكيت", nameEn: "Jacket" },
  { id: "tshirt", nameAr: "تيشيرت", nameEn: "T-Shirt" },
  { id: "sweater", nameAr: "سويتر", nameEn: "Sweater" },
  { id: "vest", nameAr: "فست/صدرية", nameEn: "Vest" },
  { id: "tie", nameAr: "ربطة عنق", nameEn: "Tie" },
  { id: "belt", nameAr: "حزام", nameEn: "Belt" },
  { id: "shoes", nameAr: "حذاء", nameEn: "Shoes" },
  { id: "accessory", nameAr: "إكسسوار", nameEn: "Accessory" },
  { id: "other", nameAr: "أخرى", nameEn: "Other" },
]

export const SEASONS = [
  { id: "all", nameAr: "كل المواسم", nameEn: "All Seasons" },
  { id: "summer", nameAr: "صيف", nameEn: "Summer" },
  { id: "winter", nameAr: "شتاء", nameEn: "Winter" },
] as const

export const SMART_SECTIONS = [
  {
    id: "new-arrivals",
    nameAr: "جديدنا",
    nameEn: "New Arrivals",
    descriptionAr: "أحدث المنتجات المضافة حديثاً",
    descriptionEn: "Latest products just arrived",
    icon: "Sparkles",
    color: "emerald",
  },
  {
    id: "best-sellers",
    nameAr: "الأكثر مبيعًا",
    nameEn: "Best Sellers",
    descriptionAr: "المنتجات الأعلى طلباً",
    descriptionEn: "Our most popular products",
    icon: "TrendingUp",
    color: "amber",
  },
  {
    id: "offers",
    nameAr: "العروض",
    nameEn: "Offers",
    descriptionAr: "خصومات حصرية لفترة محدودة",
    descriptionEn: "Exclusive limited-time discounts",
    icon: "Percent",
    color: "red",
  },
  {
    id: "seasonal",
    nameAr: "موسمي",
    nameEn: "Seasonal",
    descriptionAr: "تشكيلة الموسم الحالي",
    descriptionEn: "Current season collection",
    icon: "Sun",
    color: "blue",
  },
] as const

// ================== BLOG TYPES ==================
export interface BlogPost {
  id: string
  titleAr: string
  titleEn: string
  contentAr: string
  contentEn: string
  excerptAr: string
  excerptEn: string
  featuredImage: string
  authorName: string
  authorImage?: string
  category: BlogCategory
  tags: string[]
  views: number
  likes: number
  isPublished: boolean
  isFeatured: boolean
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

export type BlogCategory =
  | "fashion-tips"
  | "styling"
  | "trends"
  | "brand-story"
  | "how-to"
  | "news"
  | "seasonal"

export const BLOG_CATEGORIES = [
  { id: "fashion-tips", nameAr: "نصائح الموضة", nameEn: "Fashion Tips", icon: "Lightbulb", color: "emerald" },
  { id: "styling", nameAr: "التنسيق", nameEn: "Styling", icon: "Sparkles", color: "purple" },
  { id: "trends", nameAr: "الترندات", nameEn: "Trends", icon: "TrendingUp", color: "pink" },
  { id: "brand-story", nameAr: "قصتنا", nameEn: "Brand Story", icon: "Heart", color: "blue" },
  { id: "how-to", nameAr: "إرشادات", nameEn: "How To", icon: "BookOpen", color: "amber" },
  { id: "news", nameAr: "أخبار", nameEn: "News", icon: "Newspaper", color: "cyan" },
  { id: "seasonal", nameAr: "موسمي", nameEn: "Seasonal", icon: "Calendar", color: "orange" },
] as const

// ================== LOOKBOOK TYPES ==================
export interface LookbookOutfit {
  id: string
  titleAr: string
  titleEn: string
  descriptionAr: string
  descriptionEn: string
  occasionAr: string // "كاجوال", "رسمي", "سهرة"
  occasionEn: string // "Casual", "Formal", "Evening"
  season: "summer" | "winter" | "all"
  mainImage: string
  additionalImages: string[]
  products: LookbookProduct[]
  totalPrice: number
  discountedPrice?: number
  discount?: number
  views: number
  likes: number
  saves: number // How many saved to wishlist
  isActive: boolean
  isFeatured: boolean
  createdAt: Date
  updatedAt: Date
}

export interface LookbookProduct {
  productId: string
  position: number // Order in the outfit
  nameAr: string
  nameEn: string
  categoryAr: string
  categoryEn: string
  price: number
  image: string
}

export const LOOKBOOK_OCCASIONS = [
  { id: "casual", nameAr: "كاجوال", nameEn: "Casual", icon: "Coffee", color: "blue" },
  { id: "formal", nameAr: "رسمي", nameEn: "Formal", icon: "Briefcase", color: "slate" },
  { id: "evening", nameAr: "سهرة", nameEn: "Evening", icon: "Moon", color: "purple" },
  { id: "sport", nameAr: "رياضي", nameEn: "Sport", icon: "Activity", color: "emerald" },
  { id: "work", nameAr: "عمل", nameEn: "Work", icon: "Building", color: "amber" },
  { id: "party", nameAr: "حفلات", nameEn: "Party", icon: "PartyPopper", color: "pink" },
  { id: "beach", nameAr: "شاطئي", nameEn: "Beach", icon: "Waves", color: "cyan" },
  { id: "wedding", nameAr: "زفاف", nameEn: "Wedding", icon: "Heart", color: "rose" },
] as const

// ================== BACKWARDS COMPATIBILITY HELPERS ==================

/**
 * Normalize color to shadeId (handles both new ColorSelection and legacy string formats)
 */
export function normalizeColorToShadeId(color: ColorSelection | string | null | undefined): string {
  if (!color) return ""
  if (typeof color === 'string') return color
  if (color && typeof color === 'object' && 'shadeId' in color) {
    return color.shadeId
  }
  return ""
}

/**
 * Check if value is ColorSelection type
 */
export function isColorSelection(value: any): value is ColorSelection {
  return (
    value &&
    typeof value === 'object' &&
    'shadeId' in value &&
    'colorId' in value &&
    'label' in value
  )
}

/**
 * Convert ColorSelection to display string
 */
export function getColorSelectionDisplay(selection: ColorSelection | null, lang: "ar" | "en" = "ar"): string {
  if (!selection) return ""
  return selection.label || `${selection.colorId}-${selection.shadeId}`
}

/**
 * Get hex color from ColorSelection
 */
export function getHexFromColorSelection(selection: ColorSelection | null): string {
  if (!selection) return "#cccccc"
  const variant = getColorVariantById(selection.shadeId)
  return variant?.hex || "#cccccc"
}
