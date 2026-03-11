# أمثلة الاستخدام العملية

## 🎯 أمثلة عملية لكيفية استخدام كل نظام

---

## 1. نظام المخزون

### مثال 1: التحقق من المخزون قبل الشراء

```typescript
import { isStockAvailable, getAvailableQuantity } from "@/lib/stock-utils"
import { useCart } from "@/contexts/cart-context"

export function AddToCartButton({ product, selectedColor, selectedSize, quantity }) {
  const { addToCart } = useCart()
  
  const handleAddToCart = () => {
    const shadeId = selectedColor?.shadeId
    
    // التحقق من المخزون
    if (!isStockAvailable(product, shadeId, selectedSize, quantity)) {
      const available = getAvailableQuantity(product, shadeId, selectedSize)
      alert(`المتاح فقط ${available} وحدة`)
      return
    }
    
    addToCart(product, selectedColor, selectedSize, quantity)
  }
  
  return <button onClick={handleAddToCart}>أضف للسلة</button>
}
```

### مثال 2: عرض حالة المخزون

```typescript
import { StockStatusDisplay } from "@/components/stock-status-display"

export function ProductDetails({ product }) {
  return (
    <div>
      <h1>{product.nameAr}</h1>
      
      {/* عرض حالة المخزون */}
      <StockStatusDisplay 
        product={product}
        shadeId="blue-500"
        size="M"
        compact={false}
      />
    </div>
  )
}
```

### مثال 3: إدارة المخزون في Dashboard

```typescript
import { StockManagementDashboard } from "@/components/stock-management-dashboard"

export function EditProductPage() {
  const [stock, setStock] = useState<ColorSizeStock[]>([])
  
  return (
    <form>
      <StockManagementDashboard
        stock={stock}
        productName="منتج جديد"
        onStockUpdate={setStock}
      />
    </form>
  )
}
```

### مثال 4: دوال مساعدة متقدمة

```typescript
import { 
  getTotalAvailableStock,
  getAvailableSizesForShade,
  getStockStatus
} from "@/lib/stock-utils"

// الحصول على إجمالي المخزون المتاح
const available = getTotalAvailableStock(product)

// الحصول على المقاسات المتاحة لدرجة لون معينة
const sizes = getAvailableSizesForShade(product, "blue-500")
// النتيجة: ["S", "M", "L"]

// الحصول على حالة المخزون
const status = getStockStatus(product, "blue-500", "M")
// النتيجة: "available" | "low" | "out-of-stock"
```

---

## 2. نظام تتبع الطلبات

### مثال 1: عرض تتبع الطلب

```typescript
import { OrderTrackingDisplay } from "@/components/order-tracking-display"

export function OrderDetailsPage({ orderId }) {
  const [order, setOrder] = useState<Order | null>(null)
  
  useEffect(() => {
    // جلب الطلب من Firebase
    fetchOrder(orderId)
  }, [orderId])
  
  return (
    <OrderTrackingDisplay 
      order={order}
      showFullDetails={true}
    />
  )
}
```

### مثال 2: إنشاء طلب جديد

```typescript
import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

async function createOrder(orderData: Order) {
  const order = {
    ...orderData,
    status: "pending",
    shippingUpdates: [{
      status: "pending",
      timestamp: new Date(),
      notes: "تم استقبال الطلب"
    }],
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  const docRef = await addDoc(collection(db, "orders"), order)
  return docRef.id
}
```

### مثال 3: تحديث حالة الطلب

```typescript
import { doc, updateDoc, arrayUnion } from "firebase/firestore"
import { db } from "@/lib/firebase"

async function updateOrderStatus(orderId: string, newStatus: Order["status"]) {
  const orderRef = doc(db, "orders", orderId)
  
  await updateDoc(orderRef, {
    status: newStatus,
    shippingUpdates: arrayUnion({
      status: newStatus,
      timestamp: new Date(),
      location: "مركز التوزيع الرئيسي",
      notes: `الطلب في مرحلة ${newStatus}`
    }),
    updatedAt: new Date()
  })
}
```

### مثال 4: صفحة طلباتي

```typescript
export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedStatus, setSelectedStatus] = useState<"all" | Order["status"]>("all")
  
  useEffect(() => {
    if (!user) return
    
    // جلب طلبات المستخدم
    fetchUserOrders(user.id)
  }, [user])
  
  const filteredOrders = selectedStatus === "all"
    ? orders
    : orders.filter(o => o.status === selectedStatus)
  
  return (
    <div>
      <h1>طلباتي ({orders.length})</h1>
      
      {/* الفلاتر */}
      <div className="flex gap-2">
        <button onClick={() => setSelectedStatus("all")}>الكل</button>
        <button onClick={() => setSelectedStatus("processing")}>قيد المعالجة</button>
        <button onClick={() => setSelectedStatus("shipped")}>مشحون</button>
        <button onClick={() => setSelectedStatus("delivered")}>مسلم</button>
      </div>
      
      {/* قائمة الطلبات */}
      {filteredOrders.map(order => (
        <OrderTrackingDisplay key={order.id} order={order} />
      ))}
    </div>
  )
}
```

---

## 3. نظام التقييمات

### مثال 1: عرض التقييمات

```typescript
import { ProductReviewsSection } from "@/components/product-reviews-section"

export function ProductPage({ productId }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState<ProductRating | null>(null)
  
  useEffect(() => {
    // جلب التقييمات والتقييم
    fetchProductReviews(productId)
  }, [productId])
  
  const [showReviewForm, setShowReviewForm] = useState(false)
  
  return (
    <ProductReviewsSection
      productId={productId}
      reviews={reviews}
      rating={rating}
      onWriteReview={() => setShowReviewForm(true)}
    />
  )
}
```

### مثال 2: كتابة تقييم جديد

```typescript
import { WriteReviewForm } from "@/components/write-review-form"
import { collection, addDoc } from "firebase/firestore"

export function ReviewFormModal({ product, onClose }) {
  const { user } = useAuth()
  
  const handleSubmitReview = async (data) => {
    const review: Review = {
      id: "",
      productId: product.id,
      userId: user.id,
      userName: user.displayName,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      images: data.images,
      verified: true, // المستخدم اشترى المنتج
      helpful: 0,
      unhelpful: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await addDoc(collection(db, "reviews"), review)
    onClose()
  }
  
  return (
    <WriteReviewForm
      productId={product.id}
      productName={product.nameAr}
      onSubmit={handleSubmitReview}
      onCancel={onClose}
    />
  )
}
```

### مثال 3: حساب متوسط التقييم

```typescript
function calculateProductRating(reviews: Review[]): ProductRating {
  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  let totalRating = 0
  
  reviews.forEach(review => {
    ratingDistribution[review.rating]++
    totalRating += review.rating
  })
  
  return {
    productId: reviews[0].productId,
    averageRating: totalRating / reviews.length,
    totalReviews: reviews.length,
    ratingDistribution,
    recentReviews: reviews.slice(0, 5)
  }
}
```

### مثال 4: ترتيب وفلترة التقييمات

```typescript
function sortReviews(reviews: Review[], sortBy: "helpful" | "recent" | "rating") {
  switch (sortBy) {
    case "helpful":
      return [...reviews].sort((a, b) => b.helpful - a.helpful)
    case "rating":
      return [...reviews].sort((a, b) => b.rating - a.rating)
    case "recent":
    default:
      return [...reviews].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  }
}
```

---

## 4. البحث المتقدم والفلترة

### مثال 1: استخدام البحث والفلترة

```typescript
import { searchAndFilterProducts, type SearchFilters } from "@/lib/search-utils"
import { AdvancedSearchFilters } from "@/components/advanced-search-filters"

export function ShopPage() {
  const [filters, setFilters] = useState<SearchFilters>({})
  const [products, setProducts] = useState<Product[]>([])
  
  const filteredProducts = searchAndFilterProducts(products, filters)
  
  return (
    <div className="grid grid-cols-4 gap-4">
      <AdvancedSearchFilters
        onFiltersChange={setFilters}
        priceRange={{ min: 100, max: 5000 }}
        availableSizes={["XS", "S", "M", "L", "XL", "XXL"]}
      />
      
      <div className="col-span-3">
        <div className="grid grid-cols-3 gap-4">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}
```

### مثال 2: بحث Fuzzy

```typescript
import { fuzzySearch } from "@/lib/search-utils"

// البحث عن "أزرق" سيعيد: ["أزرق", "أزرق فاتح", "أزرق غامق"]
const results = fuzzySearch("أزرق", colors)
```

### مثال 3: الفلاتر المعقدة

```typescript
const filters: SearchFilters = {
  query: "قميص",
  minPrice: 100,
  maxPrice: 500,
  sizes: ["M", "L"],
  colors: ["blue-500", "black"],
  sortBy: "price-asc",
  inStock: true
}

const results = searchAndFilterProducts(allProducts, filters)
```

### مثال 4: نطاق السعر الديناميكي

```typescript
import { getPriceRange, getAvailableFilters } from "@/lib/search-utils"

// الحصول على نطاق السعر من المنتجات الحالية
const priceRange = getPriceRange(filteredProducts)
// النتيجة: { min: 100, max: 5000 }

// الحصول على الفلاتر المتاحة
const availableFilters = getAvailableFilters(filteredProducts)
// النتيجة: { 
//   sizes: ["S", "M", "L"], 
//   colors: ["blue", "red"],
//   categories: ["men", "women"],
//   priceRange: { min: 100, max: 5000 }
// }
```

---

## 5. لوحة التحليلات

### مثال 1: عرض التحليلات

```typescript
import { AnalyticsDashboard } from "@/components/analytics-dashboard"

export function AnalyticsPage() {
  const [analytics, setAnalytics] = useState({
    totalSales: 1250,
    totalRevenue: 58750,
    newCustomers: 142,
    conversionRate: 3.45,
    topProducts: [
      { name: "منتج 1", sales: 125, revenue: 12500 },
      { name: "منتج 2", sales: 98, revenue: 9800 }
    ],
    salesTrend: [
      { date: "01/01", sales: 25, revenue: 1250 },
      { date: "01/02", sales: 30, revenue: 1500 }
    ]
  })
  
  return <AnalyticsDashboard {...analytics} />
}
```

### مثال 2: حساب المقاييس من Firebase

```typescript
async function calculateAnalytics(dateRange: "7d" | "30d" | "90d") {
  // جلب الطلبات من Firebase
  const ordersQuery = query(
    collection(db, "orders"),
    where("createdAt", ">=", getDateRange(dateRange))
  )
  
  const orders = await getDocs(ordersQuery)
  
  let totalSales = 0
  let totalRevenue = 0
  const productSales: Record<string, number> = {}
  
  orders.forEach(doc => {
    const order = doc.data()
    totalSales += order.items.length
    totalRevenue += order.total
    
    order.items.forEach(item => {
      productSales[item.productId] = (productSales[item.productId] || 0) + 1
    })
  })
  
  return {
    totalSales,
    totalRevenue,
    topProducts: Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, sales]) => ({ id, sales }))
  }
}
```

### مثال 3: تصدير البيانات

```typescript
function exportAnalyticsToCSV(analytics) {
  let csv = "المقياس,القيمة\n"
  csv += `إجمالي المبيعات,${analytics.totalSales}\n`
  csv += `إجمالي الإيرادات,${analytics.totalRevenue}\n`
  csv += `عملاء جدد,${analytics.newCustomers}\n`
  
  // إضافة المنتجات الأعلى
  csv += "\nأعلى المنتجات\n"
  analytics.topProducts.forEach(p => {
    csv += `${p.name},${p.sales},${p.revenue}\n`
  })
  
  // تحميل الملف
  const element = document.createElement("a")
  element.setAttribute("href", `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`)
  element.setAttribute("download", "analytics.csv")
  element.click()
}
```

---

## 📝 نصائح عملية

### 1. استخدم Error Boundaries

```typescript
export function ProductPageWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <ProductPage />
    </ErrorBoundary>
  )
}
```

### 2. أضف Loading States

```typescript
const [loading, setLoading] = useState(false)

const handleAction = async () => {
  setLoading(true)
  try {
    await doSomething()
  } finally {
    setLoading(false)
  }
}
```

### 3. استخدم React Query للـ Caching

```typescript
import { useQuery } from "@tanstack/react-query"

const { data: product } = useQuery({
  queryKey: ["product", productId],
  queryFn: () => fetchProduct(productId)
})
```

### 4. تحقق من الصلاحيات

```typescript
const canDeleteReview = review.userId === currentUserId || currentUser.isAdmin
```

---

## 🔗 الروابط المرتبطة

- للمزيد حول المخزون: `STOCK_MANAGEMENT_GUIDE.md`
- للمزيد حول جميع الأنظمة: `COMPLETE_SYSTEMS_GUIDE.md`
- قائمة التحقق: `IMPLEMENTATION_CHECKLIST.md`

---

**اتبع هذه الأمثلة وستكون جاهزاً للبدء! 🚀**
